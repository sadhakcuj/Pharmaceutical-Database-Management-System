import { Test, TestingModule } from '@nestjs/testing';
import { StockService } from './stock.service';
import { PrismaModule } from '../prisma/prisma.module';

describe('StockService', () => {
  let service: StockService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StockService],
      imports: [PrismaModule],
    }).compile();

    service = module.get<StockService>(StockService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
