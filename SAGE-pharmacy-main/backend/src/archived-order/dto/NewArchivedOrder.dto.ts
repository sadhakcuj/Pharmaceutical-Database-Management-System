import { ApiProperty } from '@nestjs/swagger';
import { Receipt } from '@prisma/client';
import { IsArray, IsDate, IsDateString, IsString } from 'class-validator';

export class NewArchivedOrderDto {
  @ApiProperty()
  @IsString()
  orderId: string;

  @ApiProperty()
  @IsArray()
  receipts: Receipt[];
}
