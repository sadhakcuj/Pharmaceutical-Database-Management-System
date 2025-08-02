import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { join } from 'path';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ReceiptController } from './receipt.controller';
import { ReceiptService } from './receipt.service';

@Module({
  controllers: [ReceiptController],
  providers: [ReceiptService],
  imports: [
    PrismaModule,
    MulterModule.register({
      dest: join(__dirname, 'files'),
    }),
  ],
})
export class ReceiptModule {}
