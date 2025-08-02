import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SigninReturnDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Token that expires after 15 minutes',
  })
  @IsString()
  accessToken: string;

  @ApiProperty({
    description: 'Token that expires after a day',
  })
  @IsString()
  refreshToken: string;
}
