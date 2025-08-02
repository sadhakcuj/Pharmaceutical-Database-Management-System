import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ReceiptService } from './receipt.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@Controller('receipt')
@ApiTags('🧾 Receipt')
export class ReceiptController {
  constructor(private readonly receiptService: ReceiptService) {}

  @Get()
  @ApiOperation({ summary: 'Get list of receipts ID for given order' })
  async getReceipts(@Query('orderId') orderId: string) {
    const records = await this.receiptService.getReceipts(orderId);

    return {
      ids: records.map((record) => record.id),
    };
  }

  @Get(':id/type')
  @ApiOperation({
    summary: 'Returns file type, whether it is an image or pdf',
  })
  async getFileType(@Param('id') id: string) {
    try {
      const type = await this.receiptService.getFileType(id);
      return { type };
    } catch {
      throw new NotFoundException(`No receipt with ID ${id} found`);
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get receipt file with given ID',
  })
  async getReceipt(@Param('id') id: string, @Res() res: Response) {
    const file = await this.receiptService.getReceipt(id);
    file.stream.pipe(res);
  }

  @Post()
  @ApiOperation({ summary: 'Upload a receipt for an order' })
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Body() { orderId }: { orderId: string },
    @UploadedFile() file: Express.Multer.File,
  ) {
    const id = await this.receiptService.registerNewFile(
      orderId,
      file.filename,
      file.mimetype.split('/')[1],
    );
    return { id };
  }
}
