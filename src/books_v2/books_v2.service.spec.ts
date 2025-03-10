import { Test, TestingModule } from '@nestjs/testing';
import { BooksV2Service } from './books_v2.service';

describe('BooksV2Service', () => {
  let service: BooksV2Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BooksV2Service],
    }).compile();

    service = module.get<BooksV2Service>(BooksV2Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
