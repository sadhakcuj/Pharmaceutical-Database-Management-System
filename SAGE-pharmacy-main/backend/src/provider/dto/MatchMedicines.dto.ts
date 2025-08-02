import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

export class MatchMedicinesDTO {
  @IsArray()
  @ApiProperty()
  names: string[];
}
