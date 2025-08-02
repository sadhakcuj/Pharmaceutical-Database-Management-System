import { ApiProperty } from '@nestjs/swagger';
import { OrderDto } from './Order.dto';

export class AllOrders {
  @ApiProperty({
    isArray: true,
    type: OrderDto,
  })
  orders: OrderDto[];
}
