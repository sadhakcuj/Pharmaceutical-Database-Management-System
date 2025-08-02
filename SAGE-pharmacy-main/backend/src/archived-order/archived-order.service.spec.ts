import { Test, TestingModule } from '@nestjs/testing';
import { ArchivedOrderService } from './archived-order.service';

describe('ArchivedOrderService', () => {
  let service: ArchivedOrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ArchivedOrderService],
    }).compile();

    service = module.get<ArchivedOrderService>(ArchivedOrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
