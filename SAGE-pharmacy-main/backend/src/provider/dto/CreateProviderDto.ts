import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProviderDto {
  @IsString()
  @ApiProperty()
  accountNumber: string;

  @IsString()
  @ApiProperty()
  abridgment: string;

  @IsString()
  @ApiProperty()
  commonAccountNumber: string;

  @IsString()
  @ApiProperty()
  address: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  complementAdress?: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty()
  postalCode?: number;

  @IsString()
  @ApiProperty()
  city: string;

  @IsString()
  @ApiProperty()
  country: string;

  @IsArray()
  @ApiProperty({
    isArray: true,
    type: String,
  })
  telephone: string[];

  @IsOptional()
  @IsString()
  @ApiProperty()
  telecopie?: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  email?: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  contactName?: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  rc?: string;

  @IsString()
  @ApiProperty()
  stat?: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  nif?: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  cif?: string;

  @IsString()
  @ApiProperty()
  collector: string;

  @IsString()
  @ApiProperty()
  name: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty()
  min?: number;
}
