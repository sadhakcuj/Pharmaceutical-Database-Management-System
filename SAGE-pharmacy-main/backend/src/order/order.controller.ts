import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { join } from 'path';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { AllOrders } from './dto/AllOrders.dto';
import { CreateMedicineOrderDto } from './dto/CreateMedicineOrder.dto';
import { CreateOrdersDto } from './dto/CreateOrders.dto';
import { DeleteMedicineOrderDto } from './dto/DeleteMedicineOrder.dto';
import { UpdateMedicineQuantitiesDto } from './dto/UpdateMedicineQuantities.dto';
import { UpdateOrderDto } from './dto/UpdateOrder.dto';
import { OrderService } from './order.service';

@Controller('order')
@ApiTags('🛍️ Order')
@UseGuards(new AccessTokenGuard())
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('bill')
  @ApiOperation({ summary: 'Generate PDF file as bill for order' })
  async getBillFile(
    @Query('providerName') providerName: string,
    @Res() res: Response,
  ) {
    await this.orderService.createBillFile(providerName);

    const file = createReadStream(
      join(__dirname, 'bills', providerName + '.pdf'),
    );
    file.pipe(res);
  }

  @Post(':id/medicine')
  @ApiOperation({ summary: 'Add medicine to purchase order' })
  async addMedicine(
    @Param('id') id: string,
    @Body() medicine: CreateMedicineOrderDto,
  ) {
    const { medicineName, providerName } =
      await this.orderService.createMedicineOrder(
        id,
        medicine.medicineFromProviderId,
        medicine.quantity,
      );

    return `${medicineName} added to purchase order for ${providerName}`;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one order by ID' })
  getOneOrder(@Param('id') id: string) {
    return this.orderService.getOrder(id);
  }

  @Get()
  @ApiOperation({ summary: 'Returns all orders' })
  @ApiOkResponse({ type: AllOrders })
  getOrders() {
    return this.orderService.getAllOrders();
  }

  @Get('count')
  @ApiOperation({
    summary: 'Returns orders count',
  })
  getOrderCount() {
    return this.orderService.getOrderCount();
  }

  @Get('/provider/:id')
  @ApiOperation({
    summary: 'Get specific provider orders',
  })
  async getOrderOfProvider(providerId: string) {
    return await this.orderService.getOrdersOfProvider(providerId);
  }

  @Patch(':id/medicine')
  @ApiOperation({ summary: "Update order's quantity of medicine to order" })
  async updateMedicineQuantities(
    @Param('id') id: string,
    @Body() { datas }: UpdateMedicineQuantitiesDto,
  ) {
    await this.orderService.setMedicinesQuantities(id, datas);
    return `Updated`;
  }

  @Patch(':id')
  @ApiOperation({ summary: "Update order's status" })
  async setOrderStatus(
    @Param('id') id: string,
    @Body() { status }: UpdateOrderDto,
  ) {
    const statusList = [
      OrderStatus.ORDERED,
      OrderStatus.PENDING,
      OrderStatus.RECEIVED,
      OrderStatus.FINISHED,
      OrderStatus.AVOIR,
      OrderStatus.ARCHIVED,
    ];

    if (!statusList.includes(status)) {
      throw new BadRequestException('Invalid status value provided');
    }

    await this.orderService.setOrderStatus(id, status);

    return `${id} status updated to ${status}`;
  }

  @Post()
  @ApiOperation({
    summary:
      'Create order records from a raw list fo medicine ID and quantity to order',
  })
  async createOrders(@Body() createOrdersDto: CreateOrdersDto) {
    await this.orderService.createOrders(createOrdersDto);
    return 'Orders created';
  }

  @Post(':id')
  @ApiOperation({ summary: 'Delete a medicine order' })
  async deleteMedicineOrder(
    @Param('id') orderId: string,
    @Body() { medicineName }: DeleteMedicineOrderDto,
  ) {
    try {
      await this.orderService.deleteOrderMedicine(orderId, medicineName);
    } catch {
      throw new NotFoundException(`Order or medicine order not found`);
    }

    return `${medicineName} remove from order ${orderId}`;
  }

  @Post('update/:id')
  @ApiOperation({
    summary:
      'Update all order from a specific medicine because there was a medicines list update',
  })
  async updateAllOrders(@Param('id') id: string) {
    await this.orderService.updateAllOrders(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete order with given ID' })
  async deleteOrder(@Param('id') id: string) {
    await this.orderService.delete(id);
    return `Order ${id} removed`;
  }

  @Delete()
  @ApiOperation({ summary: 'Delete all orders' })
  clearOrders() {
    return this.orderService.clearOrders();
  }
}
