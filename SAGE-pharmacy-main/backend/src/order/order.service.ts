import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MedicineFromProvider, OrderStatus } from '@prisma/client';
import * as fs from 'fs';
import { readdir, unlink } from 'fs/promises';
import * as handlebars from 'handlebars';
import * as path from 'path';
import * as puppeteer from 'puppeteer';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProviderService } from 'src/provider/provider.service';
import { CreateOrdersDto } from './dto/CreateOrders.dto';

@Injectable()
export class OrderService {
  constructor(
    private providerService: ProviderService,
    private prisma: PrismaService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async clearBillFolder() {
    try {
      const bills = await readdir(path.join(__dirname, 'bills'));
      for (let file of bills) {
        const extension = path.extname(file);
        if (extension == '.pdf') {
          const bill = path.join(__dirname, 'bills', file);
          await unlink(bill);
        }
      }
    } catch (e) {
      console.error('Unable to clear bill folder : ', e);
    }
  }

  // Generate PDF file with orderMedicine list and return path to file
  async createBillFile(providerName: string): Promise<string> {
    const records = await this.prisma.order.findMany({
      where: {
        providerName,
      },
    });

    if (records.length == 0) {
      throw new NotFoundException(`No order associated to ${providerName}`);
    }

    const order = records[0];
    const orders = await this.prisma.orderMedicine.findMany({
      where: {
        orderId: order.id,
      },
      include: {
        medicine: true,
      },
    });

    if (orders.length == 0) {
      throw new BadRequestException(
        `No order medicine set for provider ${providerName}`,
      );
    }

    let priceWithTax = 0;
    let priceWithoutTax = 0;

    for (let order of orders) {
      priceWithTax += order.quantity * order.medicine.priceWithTax;
      priceWithoutTax += order.quantity * order.medicine.priceWithoutTax;
    }

    try {
      const templateHtml = fs.readFileSync(
        path.join(__dirname, 'templates', 'bill.hbs'),
        'utf-8',
      );
      const template = handlebars.compile(templateHtml);
      const html = template({
        providerName,
        createdAt: order.createdAt.toLocaleDateString(),
        orders: orders.map((order) => ({
          medicineName: order.medicine.name,
          quantity: order.quantity,
          priceWithTax: order.medicine.priceWithTax,
          priceWithoutTax: order.medicine.priceWithoutTax,
        })),
        priceWithoutTax,
        priceWithTax,
      });

      const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
        executablePath: '/usr/bin/google-chrome',
        headless: 'new',
      });

      const page = await browser.newPage();
      await page.setContent(html, {
        waitUntil: 'networkidle0',
      });

      const filePath = path.join(__dirname, 'bills', providerName + '.pdf');
      await page.pdf({
        width: '1080px',
        printBackground: true,
        path: filePath,
      });

      await browser.close();

      return filePath;
    } catch (e) {
      console.error(e);
      throw new ServiceUnavailableException(`Failed to create PDF file`);
    }
  }

  async createMedicineOrder(
    orderId: string,
    medicineFromProviderId: string,
    quantity: number,
  ) {
    const record = await this.prisma.orderMedicine.create({
      data: {
        quantity,
        medicineFromProviderId,
        orderId,
      },
      include: {
        medicine: true,
        Order: true,
      },
    });

    return {
      medicineName: record.medicine.name,
      providerName: record.Order.providerName,
    };
  }

  deleteOrderMedicine(orderId: string, medicineName: string) {
    return this.prisma.orderMedicine.deleteMany({
      where: {
        orderId,
        medicine: {
          name: medicineName,
        },
      },
    });
  }

  async delete(id: string) {
    try {
      await this.prisma.orderMedicine.deleteMany({
        where: {
          orderId: id,
        },
      });
      await this.prisma.order.delete({
        where: { id },
      });
    } catch (e) {
      throw new NotFoundException(`No matching order with ID : ${id}`);
    }
  }

  getOrderCount() {
    return this.prisma.order.count();
  }

  async getOrder(id: string) {
    const record = await this.prisma.order.findUnique({
      where: { id },
      include: {
        provider: true,
        medicineOrders: true,
      },
    });

    if (!record) {
      throw new NotFoundException(`No order with ID : ${id}`);
    }

    const order = {
      provider: record.provider,
      providerName: record.provider.name,
      minPurchase: record.provider.min,
      minQuantity: record.provider.minQuantity,
      status: record.status,
      totalPriceWithoutTax: 0,
      totalPriceWithTax: 0,
      createdAt: record.createdAt,
      id: record.id,
      orderMedicines: [],
    };

    // Compute prices
    for (let medicineOrder of record.medicineOrders) {
      const medicineFromProvider =
        await this.prisma.medicineFromProvider.findUnique({
          where: {
            id: medicineOrder.medicineFromProviderId,
          },
        });
      order.totalPriceWithTax +=
        medicineOrder.quantity * medicineFromProvider.priceWithTax;
      order.totalPriceWithoutTax +=
        medicineOrder.quantity * medicineFromProvider.priceWithoutTax;
    }

    const medicinesFromProviderInOrder: (MedicineFromProvider & {
      quantityToOrder: number;
    })[] = [];
    for (let orderMedicine of record.medicineOrders) {
      const medicine = await this.prisma.medicineFromProvider.findUnique({
        where: {
          id: orderMedicine.medicineFromProviderId,
        },
      });
      medicinesFromProviderInOrder.push({
        ...medicine,
        quantityToOrder: orderMedicine.quantity,
      });
    }
    order.orderMedicines = medicinesFromProviderInOrder;

    return order;
  }

  async setOrderQuantity(orderId: string, quantity: number) {
    this.prisma.order.update({
      where: {
        id: orderId,
      },
      data: {},
    });
  }

  setMedicinesQuantities(
    orderId: string,
    medicines: {
      name: string;
      quantity: number;
    }[],
  ) {
    return Promise.allSettled(
      medicines.map(({ name, quantity }) =>
        this.prisma.orderMedicine.updateMany({
          where: {
            orderId,
            medicine: {
              name,
            },
          },
          data: {
            quantity,
          },
        }),
      ),
    );
  }

  async setOrderStatus(orderId: string, status: OrderStatus) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException(`No matching order with ID ${orderId}`);
    }

    const map = new Map<OrderStatus, OrderStatus[]>();
    map.set(OrderStatus.ORDERED, [OrderStatus.PENDING]);
    map.set(OrderStatus.PENDING, [OrderStatus.ORDERED, OrderStatus.RECEIVED]);
    map.set(OrderStatus.RECEIVED, [OrderStatus.FINISHED, OrderStatus.AVOIR]);
    map.set(OrderStatus.FINISHED, [OrderStatus.RECEIVED, OrderStatus.ARCHIVED]);
    map.set(OrderStatus.AVOIR, [OrderStatus.RECEIVED, OrderStatus.FINISHED]);

    const value = map.get(order.status);
    if (!value.includes(status)) {
      throw new BadRequestException(
        `Invalid status provided: ${status} . Order has status: ${order.status}`,
      );
    }

    await this.prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status,
      },
    });
  }

  async getAllOrders() {
    const orders: {
      providerName: string;
      minPurchase?: number;
      minQuantity?: number;
      status: OrderStatus;
      totalPriceWithTax: number;
      totalPriceWithoutTax: number;
      createdAt: Date;
      id: string;
      orderMedicines: MedicineFromProvider[];
    }[] = [];

    const records = await this.prisma.order.findMany({
      select: {
        id: true,
      },
    });

    for (let { id } of records) {
      const order = await this.getOrder(id);
      orders.push(order);
    }

    return orders;
  }

  async clearOrders() {
    await this.prisma.order.deleteMany();
    await this.prisma.orderMedicine.deleteMany();
  }

  async createOrders(createOrdersDto: CreateOrdersDto) {
    // provider's name -> medicine orders
    const orders = new Map<
      string,
      {
        medicineId: string;
        quantity: number;
      }[]
    >();

    for (let order of createOrdersDto.orders) {
      if (order.medicineId) {
        const provider = await this.providerService.getOwner(order.medicineId);

        const medicines = orders.get(provider.name);
        const record = {
          medicineId: order.medicineId,
          quantity: order.quantityToOrder,
        };

        if (medicines) {
          medicines.push(record);
        } else {
          orders.set(provider.name, [record]);
        }
      } else if (order.medicine) {
        const provider = await this.providerService.getOne(
          order.medicine.owner,
        );

        const records = await this.prisma.medicineFromProvider.findMany({
          where: {
            providerId: provider.id,
            name: order.medicine.name,
          },
          select: { id: true },
        });
        const medicineId = records[0].id;

        const medicines = orders.get(provider.name);
        const record = {
          medicineId: medicineId,
          quantity: order.quantityToOrder,
        };

        if (medicines) {
          medicines.push(record);
        } else {
          orders.set(provider.name, [record]);
        }
      }
    }

    for (let [providerName, medicines] of orders) {
      const records = await this.prisma.order.findMany({
        where: {
          providerName,
          status: 'ORDERED',
        },
      });

      if (records.length == 0) {
        // create new order
        await this.prisma.order.create({
          data: {
            providerName,
            medicineOrders: {
              create: medicines.map((medicine) => ({
                quantity: medicine.quantity,
                medicine: {
                  connect: {
                    id: medicine.medicineId,
                  },
                },
              })),
            },
          },
        });
      } else {
        for (let record of records) {
          // existing order, push new medicine to order
          await this.prisma.orderMedicine.createMany({
            data: medicines.map((medicine) => ({
              medicineFromProviderId: medicine.medicineId,
              quantity: medicine.quantity,
              orderId: record.id,
            })),
          });
        }
      }
    }
  }

  async updateAllOrders(id: string) {
    const orderMedicines = await this.prisma.orderMedicine.findMany({
      where: {
        Order: {
          provider: {
            id,
          },
        },
      },
    });

    const provider = await this.prisma.provider.findUnique({
      where: {
        id,
      },
      include: {
        medicines: true,
      },
    });
  }

  async getOrdersOfProvider(providerId: string) {
    return await this.prisma.order.findMany({
      where: {
        provider: {
          id: providerId,
        },
      },
    });
  }
}
