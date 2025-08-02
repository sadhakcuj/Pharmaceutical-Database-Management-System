import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DeleteMedicineOrderDto {
  @ApiProperty()
  @IsString()
  medicineName: string;
}
