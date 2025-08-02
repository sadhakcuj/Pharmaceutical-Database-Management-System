import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ArchivedOrderService } from './archived-order.service';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { NewArchivedOrderDto } from './dto/NewArchivedOrder.dto';

@Controller('archived-order')
@ApiTags('🛕 Archive')
export class ArchivedOrderController {
  constructor(private readonly archivedOrderService: ArchivedOrderService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all archived orders',
  })
  async getAllArchivedOrders() {
    return await this.archivedOrderService.getAllArchivedOrders();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get one specific archived order',
  })
  async getOneArchivedOrder(@Param('id') id: string) {
    return await this.archivedOrderService.getOneArchivedOrder(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Add new archived order',
  })
  async createArchivedOrder(@Body() newArhivedOrderDto: NewArchivedOrderDto) {
    return await this.archivedOrderService.createArchivedOrder(
      newArhivedOrderDto,
    );
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update archived oder',
  })
  async updateArchivedOrder(
    @Param('id') id: string,
    @Body() updatedArchiveData: NewArchivedOrderDto,
  ) {
    return await this.archivedOrderService.updateArchivedOrder(
      id,
      updatedArchiveData,
    );
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete archived order',
  })
  async deleteArchivedOrder(@Param('id') id: string) {
    this.archivedOrderService.deleteArchivedData(id);
  }
}
