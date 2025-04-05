import { Test, TestingModule } from '@nestjs/testing';
import { StudentNotifyService } from './student-notify.service';

describe('StudentNotifyService', () => {
  let service: StudentNotifyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StudentNotifyService],
    }).compile();

    service = module.get<StudentNotifyService>(StudentNotifyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
