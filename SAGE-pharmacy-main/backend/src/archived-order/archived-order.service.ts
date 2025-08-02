import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';
import { NewArchivedOrderDto } from './dto/NewArchivedOrder.dto';

@Injectable()
export class ArchivedOrderService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllArchivedOrders() {
    try {
      const res = await this.prisma.archivedOrder.findMany({
        include: {
          receipts: true,
        },
      });
      return res;
    } catch (err) {
      console.log(err);
      throw new NotFoundException('Error getting archived orders.');
    }
  }

  async getOneArchivedOrder(id: string) {
    try {
      return await this.prisma.archivedOrder.findUnique({
        where: {
          id,
        },
      });
    } catch (err) {
      console.log(err);
      throw new Error('Error getting archived order with id: ' + id);
    }
  }

  async createArchivedOrder(newArhivedOrderDto: NewArchivedOrderDto) {
    try {
      const { providerName, createdAt } = await this.prisma.order.findUnique({
        where: {
          id: newArhivedOrderDto.orderId,
        },
        select: {
          providerName: true,
          createdAt: true,
        },
      });

      return await this.prisma.archivedOrder.create({
        data: {
          orderCreationDate: createdAt,
          providerName: providerName,
          createdAt: new Date(),
          receipts: {
            connect: newArhivedOrderDto.receipts.map((receipt) => {
              return { id: receipt.id };
            }),
          },
        },
        include: {
          receipts: true,
        },
      });
    } catch (err) {
      console.log(err);
      throw new BadRequestException('Error creating new archived order.');
    }
  }

  async updateArchivedOrder(
    id: string,
    updatedArchiveData: NewArchivedOrderDto,
  ) {
    try {
      const { providerName, createdAt } = await this.prisma.order.findUnique({
        where: {
          id: updatedArchiveData.orderId,
        },
        select: {
          providerName: true,
          createdAt: true,
        },
      });

      const archivedOrderReceipts = (
        await this.prisma.archivedOrder.findUnique({
          where: {
            id,
          },
          select: {
            receipts: true,
          },
        })
      ).receipts;

      return await this.prisma.archivedOrder.update({
        where: {
          id,
        },
        data: {
          providerName,
          orderCreationDate: createdAt,
          receipts: {
            connect: updatedArchiveData.receipts.map((receipt) => {
              return { id: receipt.id };
            }),
            disconnect: archivedOrderReceipts.map((receipt) => {
              return { id: receipt.id };
            }),
          },
        },
      });
    } catch (err) {
      console.log(err);
      throw new BadRequestException(
        'Error updating archived order with id :' +
          id +
          ' . Bad body object sent.',
      );
    }
  }

  async deleteArchivedData(id: string) {
    try {
      return await this.prisma.archivedOrder.delete({
        where: {
          id,
        },
      });
    } catch (err) {
      throw new NotFoundException(
        "Can't find archived order with id: " + id + '.',
      );
    }
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async convertFinishedOrdersToArchivedOrders() {
    // get all order with status FINISHED
    const finishedOrders = await this.prisma.order.findMany({
      where: {
        status: 'FINISHED',
      },
      select: {
        id: true,
        receipts: true,
      },
    });

    // Update all order from FINISHED to ARCHIVED
    await this.prisma.order.updateMany({
      where: {
        id: {
          in: finishedOrders.map((order) => order.id),
        },
      },
      data: {
        status: 'ARCHIVED',
      },
    });

    // Create for each finished order an archived order equivalent
    for (let order of finishedOrders) {
      await this.createArchivedOrder({
        orderId: order.id,
        receipts: order.receipts,
      });
    }
  }
}
