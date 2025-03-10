import { Test, TestingModule } from '@nestjs/testing';
import { BooksV2Controller } from './books_v2.controller';

describe('BooksV2Controller', () => {
  let controller: BooksV2Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BooksV2Controller],
    }).compile();

    controller = module.get<BooksV2Controller>(BooksV2Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
