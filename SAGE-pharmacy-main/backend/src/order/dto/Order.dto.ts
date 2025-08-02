import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class OrderDto {
  @ApiProperty()
  @IsString()
  providerName: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  minPurchase: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  minQuantity: number;

  @ApiProperty()
  @IsNumber()
  totalPriceWithTax: number;

  @ApiProperty()
  @IsNumber()
  totalPriceWithoutTax: number;
}
