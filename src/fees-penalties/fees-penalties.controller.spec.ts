import { Test, TestingModule } from '@nestjs/testing';
import { FeesPenaltiesController } from './fees-penalties.controller';

describe('FeesPenaltiesController', () => {
  let controller: FeesPenaltiesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FeesPenaltiesController],
    }).compile();

    controller = module.get<FeesPenaltiesController>(FeesPenaltiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
