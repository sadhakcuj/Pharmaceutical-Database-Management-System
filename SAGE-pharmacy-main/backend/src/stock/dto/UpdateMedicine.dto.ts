import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateMedicineDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  name?: string;

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional()
  quantity?: number;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  location?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  dci?: string;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional()
  isTaxed?: boolean;

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional()
  min?: number;

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional()
  max?: number;

  @IsDate()
  @IsOptional()
  @ApiPropertyOptional()
  expirationDate?: Date;

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional()
  costPrice?: number;

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional()
  sellingPrice?: number;
}
