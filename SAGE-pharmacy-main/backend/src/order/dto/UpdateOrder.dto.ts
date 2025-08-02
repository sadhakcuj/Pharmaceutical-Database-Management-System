import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';
import { IsString } from 'class-validator';

export class UpdateOrderDto {
  @ApiProperty({
    enum: OrderStatus,
  })
  @IsString()
  status: OrderStatus;
}
