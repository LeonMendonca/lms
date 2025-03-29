import { Test, TestingModule } from '@nestjs/testing';
import { FeesPenaltiesService } from './fees-penalties.service';

describe('FeesPenaltiesService', () => {
  let service: FeesPenaltiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FeesPenaltiesService],
    }).compile();

    service = module.get<FeesPenaltiesService>(FeesPenaltiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
