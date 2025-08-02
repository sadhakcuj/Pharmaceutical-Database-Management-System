import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Patch,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { StockService } from '../stock/stock.service';
import { CreateProviderDto } from './dto/CreateProviderDto';
import { UpdateMatchesDto } from './dto/UpdateMatches.dto';
import { ProviderService } from './provider.service';
import * as XLSX from 'xlsx';
import { MedicineFromProvider } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@ApiTags('🏭 Provider')
@Controller('provider')
@UseGuards(new AccessTokenGuard())
export class ProviderController {
  constructor(
    private readonly providerService: ProviderService,
    private stockService: StockService,
    private configService: ConfigService,
  ) {}

  @Post('medicine/update-matches')
  @ApiOperation({
    summary: 'Update matching medicine from stock for medicine from providers',
  })
  async updateMedicineMatches(@Body() { matches }: UpdateMatchesDto) {
    await this.providerService.updateMatches(matches);
  }

  @Get()
  @ApiOperation({ summary: 'Returns all provider with their medicines' })
  getAllProviders() {
    return this.providerService.getAll();
  }

  @Get('provide')
  @ApiOperation({
    summary:
      'Check medicines with near low quantity and find matches from providers',
  })
  @ApiOkResponse({
    description:
      'Returns a map that has medicine name as key and medicine list from providers ',
  })
  @ApiNotFoundResponse({ description: 'If no matching has been done' })
  async provideMedicinesForNearLow() {
    try {
      const RUST_API_PORT =
        this.configService.get<number>('RUST_API_PORT') || 8080;
      
      const res = await fetch(
        `http://${
          this.configService.get('NODE_ENV') === 'production'
            ? 'rust-api'
            : 'localhost'
        }:${RUST_API_PORT}/provider/provide`,
      );
      return res.json();
    } catch (e) {
      console.error('Failed to use Rust API : ', e);

      const ids = (await this.stockService.getNearLowMedicines()).map(
        (record) => record.id,
      );

      const matchingMedicines =
        await this.providerService.getMatchingMedicinesForList(ids);

      const matches: {
        name: string;
        stockMin: number;
        providerMedicines: (typeof matchingMedicines)[keyof typeof matchingMedicines];
      }[] = [];

      await Promise.all(
        Object.keys(matchingMedicines).map(async (id) => {
          const medicine = await this.stockService.getMedicine(id);
          const { name, min } = medicine;

          matches.push({
            name,
            stockMin: min,
            providerMedicines: matchingMedicines[id],
          });
        }),
      );

      return matches.sort((a, b) => (a.name < b.name ? -1 : 1));
    }
  }

  @Get('medicines')
  @ApiOperation({ summary: "Returns list of provider's medicines" })
  async getMedicines(@Query('providerName') providerName: string) {
    const { medicines } = await this.providerService.getMedicines(providerName);
    return medicines;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Returns one provider' })
  async getOneProvider(@Param('id') id: string) {
    const provider = await this.providerService.getOne(id);
    if (!provider) {
      throw new NotFoundException(`Provider with ID ${id} not found`);
    }

    return provider;
  }

  @Post()
  @ApiOperation({
    summary: 'Create new provider without medicines and without order',
  })
  async createProvider(@Body() createProviderDto: CreateProviderDto) {
    return await this.providerService.createProvider(createProviderDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a provider',
  })
  async deleteProvider(@Param('id') id: string) {
    return await this.providerService.deleteProvider(id);
  }

  @Post('import/:id')
  @UseInterceptors(FileInterceptor('xlsx-file'))
  @ApiOperation({
    summary: 'Import medicines for a provider from xlsx file',
  })
  async importMedicinesForProviderFromFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('id') id: string,
  ) {
    const wb = XLSX.read(file.buffer);
    const worksheet = wb.Sheets[wb.SheetNames[0]];
    const newMedicines: MedicineFromProvider[] =
      XLSX.utils.sheet_to_json(worksheet);
    this.providerService.updateProviderMedicines(
      id,
      newMedicines.map((medicine) => {
        const { id, providerId, ...others } = medicine;
        return others;
      }),
    );
  }

  @Patch()
  @ApiOperation({
    summary: 'Update a provider',
  })
  async updateProvider(
    @Body() data: { providerId: string; data: CreateProviderDto },
  ) {
    return await this.providerService.updateProvider(data);
  }
}
