import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

class Match {
  @IsString()
  @ApiProperty()
  id: string; // Medicine from provider ID

  @IsArray()
  @ApiProperty({
    isArray: true,
    type: String,
  })
  medicineIds: string[]; // Medicine from stock IDs
}

export class UpdateMatchesDto {
  @IsArray()
  @ApiProperty({
    isArray: true,
    type: Match,
  })
  matches: Match[];
}
