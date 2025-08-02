import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateMedicineDto {
  @IsString()
  @ApiProperty()
  name: string;

  @IsString()
  @ApiProperty()
  location: string;

  @IsString()
  @ApiProperty()
  dci: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  nomenclature?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  type?: string;

  @IsString()
  @ApiProperty()
  family: string;

  @IsNumber()
  @ApiProperty()
  sellingPrice: number;

  @IsNumber()
  @ApiProperty()
  costPrice: number;

  @IsNumber()
  @ApiProperty()
  quantity: number;

  @IsNumber()
  @ApiProperty()
  real: number;

  @IsNumber()
  @ApiProperty()
  min: number;

  @IsNumber()
  @ApiProperty()
  alert: number;

  @IsNumber()
  @ApiProperty()
  max: number;

  @IsBoolean()
  @ApiProperty()
  isTaxed: boolean;

  @IsDateString()
  @ApiProperty()
  expirationDate: Date;

  @IsString()
  @ApiProperty()
  reference: string;
}
