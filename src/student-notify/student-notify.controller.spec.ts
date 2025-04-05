import { Test, TestingModule } from '@nestjs/testing';
import { StudentNotifyController } from './student-notify.controller';
import { StudentNotifyService } from './student-notify.service';

describe('StudentNotifyController', () => {
  let controller: StudentNotifyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentNotifyController],
      providers: [StudentNotifyService],
    }).compile();

    controller = module.get<StudentNotifyController>(StudentNotifyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
