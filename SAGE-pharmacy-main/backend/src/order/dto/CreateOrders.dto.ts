import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

class Medicine {
  @IsString()
  name: string;

  @IsUUID()
  owner: string;
}

class Order {
  @ApiProperty()
  @IsOptional()
  @IsUUID()
  medicineId?: string;

  @ApiProperty()
  @IsOptional()
  medicine?: Medicine;

  @ApiProperty()
  @IsNumber()
  quantityToOrder: number;
}

export class CreateOrdersDto {
  @ApiProperty({
    type: 'array',
  })
  @IsArray()
  orders: Order[];
}
