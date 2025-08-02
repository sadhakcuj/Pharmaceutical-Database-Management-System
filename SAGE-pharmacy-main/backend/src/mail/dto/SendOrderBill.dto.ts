import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class SendOrderBillDto {
    @IsString()
    @ApiProperty()
    providerName: string;

    @IsString()
    @ApiProperty()
    mail: string;
    
    @IsString()
    @IsOptional()
    @ApiProperty()
    subject?: string;
}