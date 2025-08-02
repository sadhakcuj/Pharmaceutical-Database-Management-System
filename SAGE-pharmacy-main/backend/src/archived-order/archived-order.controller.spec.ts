import { Test, TestingModule } from '@nestjs/testing';
import { ArchivedOrderController } from './archived-order.controller';
import { ArchivedOrderService } from './archived-order.service';

describe('ArchivedOrderController', () => {
  let controller: ArchivedOrderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArchivedOrderController],
      providers: [ArchivedOrderService],
    }).compile();

    controller = module.get<ArchivedOrderController>(ArchivedOrderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
