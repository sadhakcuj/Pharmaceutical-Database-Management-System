import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { createReadStream, promises as fs } from 'fs';
import { join } from 'path';

@Injectable()
export class ReceiptService {
  constructor(private prisma: PrismaService) {}

  async getFileType(id: string) {
    const { filename } = await this.prisma.receipt.findUnique({
      where: { id },
      select: { filename: true },
    });

    return filename.split('.')[1];
  }

  async getReceipt(id: string) {
    const record = await this.prisma.receipt.findUnique({
      where: {
        id,
      },
      select: {
        filename: true,
      },
    });

    if (!record) {
      throw new NotFoundException(`No receipt with ID : ${id}`);
    }

    const stream = createReadStream(join(__dirname, 'files', record.filename));
    return {
      stream,
      type: record.filename.split('.')[1],
    };
  }

  getReceipts(orderId: string) {
    return this.prisma.receipt.findMany({
      where: { orderId },
      select: { id: true },
    });
  }

  // Rename new file using its ID from database and returns that ID
  async registerNewFile(orderId: string, filename: string, extension: string) {
    const dir = join(__dirname, 'files');

    try {
      const { id } = await this.prisma.receipt.create({
        data: {
          filename,
          orderId,
        },
        select: {
          id: true,
        },
      });

      const newFilename = `${id}.${extension}`;
      await fs.rename(join(dir, filename), join(dir, newFilename));

      await this.prisma.receipt.update({
        where: { id },
        data: {
          filename: newFilename,
        },
      });

      return id;
    } catch (e) {
      console.error(e);
      throw new BadRequestException(`Invalid order ID`);
    }
  }
}
