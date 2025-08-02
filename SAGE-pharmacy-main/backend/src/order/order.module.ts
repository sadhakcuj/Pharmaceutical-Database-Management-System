import { Module } from '@nestjs/common';
import { ReceiptModule } from 'src/receipt/receipt.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ProviderModule } from 'src/provider/provider.module';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  controllers: [OrderController],
  providers: [OrderService],
  imports: [PrismaModule, ProviderModule, ReceiptModule],
  exports: [OrderService],
})
export class OrderModule {
  constructor(private orderService: OrderService) {}
}
