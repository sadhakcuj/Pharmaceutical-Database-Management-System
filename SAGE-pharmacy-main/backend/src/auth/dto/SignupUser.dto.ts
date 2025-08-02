import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { IsOptional, IsString } from 'class-validator';

export class SignupUserDto {
  @IsString()
  @ApiProperty()
  name: string;

  @IsString()
  @ApiProperty()
  password: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    enum: UserRole,
  })
  role?: UserRole;
}
