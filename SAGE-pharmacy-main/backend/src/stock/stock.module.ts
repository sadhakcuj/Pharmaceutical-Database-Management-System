import { Module } from '@nestjs/common';
import { StockService } from './stock.service';
import { StockController } from './stock.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  providers: [StockService],
  controllers: [StockController],
  imports: [PrismaModule],
  exports: [StockService],
})
export class StockModule {}
