import { Module } from '@nestjs/common';
import { ArchivedOrderService } from './archived-order.service';
import { ArchivedOrderController } from './archived-order.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [ArchivedOrderController],
  providers: [ArchivedOrderService],
  imports: [PrismaModule],
})
export class ArchivedOrderModule {}
