import {
  Body,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MedicineFromProvider, Provider } from '@prisma/client';
import { StockService } from 'src/stock/stock.service';
import { cpSync } from 'fs';
import { CreateProviderDto } from './dto/CreateProviderDto';
import { OrderService } from 'src/order/order.service';

// Utility type used for stock medicine and provider's medicine matching
type MedicineMapRecord = {
  medicine: MedicineFromProvider;
  provider: {
    name: string;
  };
  quantityToOrder: number;
};

@Injectable()
export class ProviderService {
  constructor(
    readonly prisma: PrismaService,
    private stockService: StockService,
  ) {}

  getMedicines(name: string) {
    return this.prisma.provider.findUnique({
      where: {
        name,
      },
      select: {
        medicines: true,
      },
    });
  }

  updateMatches(
    matches: {
      id: string;
      medicineIds: string[];
    }[],
  ) {
    return Promise.allSettled(
      matches.map(async ({ id, medicineIds }) => {
        if (medicineIds.length == 0) {
          return this.prisma.medicine.update({
            where: { id },
            data: {
              medicineFromProviders: {
                set: [],
              },
            },
          });
        }

        return this.prisma.medicineFromProvider.update({
          where: { id },
          data: {
            matchingMedicines: {
              connect: medicineIds.map((id) => ({ id })),
            },
          },
        });
      }),
    );
  }

  // Returns all providers with their medicines
  getAll() {
    return this.prisma.provider.findMany({
      include: {
        medicines: true,
      },
    });
  }

  async hasMedicineFromProviderBeenOrdered(id: string) {
    const records = await this.prisma.orderMedicine.findMany({
      where: {
        medicineFromProviderId: id,
      },
    });

    for (let record of records) {
      if (record.medicineFromProviderId == id) return true;
    }

    return false;
  }

  async getOwner(medicineId: string) {
    const providers = await this.prisma.provider.findMany({
      where: {
        medicines: {
          some: {
            id: medicineId,
          },
        },
      },
    });

    if (providers.length === 0) {
      return null;
    }

    return providers[0];
  }

  getOne(id: string) {
    return this.prisma.provider.findUnique({
      where: {
        id,
      },
      include: {
        medicines: {
          include: {
            matchingMedicines: true,
          },
        },
      },
    });
  }

  getMedicineNames() {
    return this.prisma.medicineFromProvider.findMany({
      select: {
        name: true,
      },
    });
  }

  async getMatchingMedicinesByName(name: string) {
    const medicineNames = (await this.getMedicineNames()).map(
      ({ name }) => name,
    );

    const names = medicineNames.filter(
      (medicine) =>
        medicine.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(medicine.toLowerCase()),
    );

    const medicines = await this.prisma.medicineFromProvider.findMany({
      where: {
        name: {
          in: names,
        },
      },
    });

    const records: typeof medicines = [];
    for (let medicine of medicines) {
      const ordered = await this.hasMedicineFromProviderBeenOrdered(
        medicine.id,
      );
      if (!ordered) {
        records.push(medicine);
      }
    }
    return records;
  }

  async getMatchingMedicines(id: string) {
    const medicine = await this.stockService.getMedicine(id);
    if (!medicine) {
      return [];
    }

    const medicinesFromProvider =
      await this.prisma.medicineFromProvider.findMany({
        where: {
          matchingMedicines: {
            some: {
              id,
            },
          },
        },
      });

    const orders = await this.prisma.orderMedicine.count({
      where: {
        medicine: {
          id: {
            in: medicinesFromProvider.map((medicine) => medicine.id),
          },
        },
      },
    });

    return orders === 0 ? medicinesFromProvider : [];
  }

  // return matching medicines for given medicine IDs
  async getMatchingMedicinesForList(
    ids: string[],
  ): Promise<Record<string, MedicineMapRecord[]>> {
    const map = new Map<string, MedicineMapRecord[]>();

    const matchName = async (id: string) => {
      let medicines = await this.getMatchingMedicines(id);
      if (medicines.length > 0) {
        const record: MedicineMapRecord[] = [];
        for (let medicine of medicines) {
          const provider = await this.getOne(medicine.providerId);
          const medicineInStock = await this.stockService.getMedicine(id);

          const numberOfMedicinesToOrder =
            medicineInStock.max - medicineInStock.quantity;

          record.push({
            medicine,
            provider: {
              name: provider.name,
            },
            quantityToOrder:
              medicine.quantity > numberOfMedicinesToOrder
                ? numberOfMedicinesToOrder
                : medicine.quantity,
          });
        }
        map.set(id, record);
      }
    };

    await Promise.allSettled(ids.map((id) => matchName(id)));

    if (map.size === 0) {
      throw new NotFoundException(
        'No available medicine from provider for given medicine ID',
      );
    }

    let ret: any = {};
    for (let key of map.keys()) {
      ret[key] = map.get(key);
    }

    return ret;
  }

  // create new medicine without adding medicines nor order
  async createProvider(createProviderDto: CreateProviderDto) {
    const provider = { ...createProviderDto };
    try {
      const res = await this.prisma.provider.create({
        data: provider,
      });
      return res;
    } catch (e) {
      console.error(e);
      throw new BadRequestException('Invalid data received as body data');
    }
  }

  // delete provider
  async deleteProvider(providerId: string) {
    try {
      await this.deleteOrderAssociatedWithProvider(providerId);
      const res = await this.prisma.provider.delete({
        where: {
          id: providerId,
        },
      });
      return res;
    } catch (e) {
      throw new NotFoundException(
        `Provider with ${providerId} not found. Error: ${e}`,
      );
    }
  }

  async deleteOrderAssociatedWithProvider(providerId: string) {
    // delete all order that are associated with the provider
    const orders = await this.prisma.order.findMany({
      where: {
        provider: {
          id: providerId,
        },
        status: {
          in: ['ORDERED', 'PENDING'],
        },
      },
    });
    const res = await this.prisma.orderMedicine.deleteMany({
      where: {
        orderId: {
          in: orders.map((order) => order.id),
        },
        Order: {
          status: {
            in: ['ORDERED', 'PENDING'],
          },
        },
      },
    });
    await this.prisma.order.deleteMany({
      where: {
        provider: {
          id: providerId,
        },
        status: {
          in: ['ORDERED', 'PENDING'],
        },
      },
    });

    // quit function if no order with status "ORDERED" or "PENDING" where found
    if (orders.length == 0) return;

    // delete all medicine associated with prpviderId
    await this.prisma.medicineFromProvider.deleteMany({
      where: {
        providerId,
      },
    });
  }

  // update specific provider medicines
  async updateProviderMedicines(
    providerId: string,
    newMedicines: Omit<MedicineFromProvider, 'id' | 'providerId'>[],
  ) {
    // delete all orders in ORDERED, order's medicines and mecicine from provider of the provider provided (prevent foreign key error)
    await this.deleteOrderAssociatedWithProvider(providerId);

    // delete all provider's medicines
    const { count } = await this.prisma.medicineFromProvider.deleteMany({
      where: {
        providerId,
      },
    });

    // add all new medicines to medicines from provider list
    await this.prisma.medicineFromProvider.createMany({
      data: newMedicines.map((medicine) => ({ ...medicine, providerId })),
    });
  }

  async updateProvider({
    providerId,
    data,
  }: {
    providerId: string;
    data: CreateProviderDto;
  }) {
    try {
      return await this.prisma.provider.update({
        data: data,
        where: {
          id: providerId,
        },
      });
    } catch (err) {
      throw new BadRequestException('Invalid body data passed');
    }
  }
}
