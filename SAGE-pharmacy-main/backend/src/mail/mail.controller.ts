import {
  Body,
  Controller,
  Post
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SendOrderBillDto } from './dto/SendOrderBill.dto';
import { MailService } from './mail.service';

@Controller('mail')
@ApiTags('📧 Mail')
export class MailController {
  constructor(private mailService: MailService) {}

  @Post('order')
  @ApiOperation({ summary: 'Send bill to provider' })
  sendOrderBill(@Body() { providerName, mail, subject }: SendOrderBillDto) {
    return this.mailService.sendOrderBill(providerName, mail, subject);
  }
}
