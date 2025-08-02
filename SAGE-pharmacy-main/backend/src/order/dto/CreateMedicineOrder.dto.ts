import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsString } from 'class-validator';

export class CreateMedicineOrderDto {
  @IsString()
  @ApiProperty()
  medicineFromProviderId: string;

  @IsNumber()
  @IsPositive()
  @ApiProperty()
  quantity: number;
}
