import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsPositive, IsString } from 'class-validator';

class Quantity {
  @IsString()
  @ApiProperty()
  name: string;

  @IsNumber()
  @IsPositive()
  @ApiProperty()
  quantity: number;
}

export class UpdateMedicineQuantitiesDto {
  @ApiProperty({
    isArray: true,
    type: Quantity,
  })
  @IsArray()
  datas: Quantity[];
}
