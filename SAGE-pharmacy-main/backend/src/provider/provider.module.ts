import { Module } from '@nestjs/common';
import { ProviderService } from './provider.service';
import { ProviderController } from './provider.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { StockModule } from '../stock/stock.module';
import { OrderModule } from 'src/order/order.module';

@Module({
  controllers: [ProviderController],
  providers: [ProviderService],
  exports: [ProviderService],
  imports: [PrismaModule, StockModule],
})
export class ProviderModule {}
