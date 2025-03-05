import { Module } from '@nestjs/common';
import { BooksV2Controller } from './books_v2.controller';
import { BooksV2Service } from './books_v2.service';

@Module({
  controllers: [BooksV2Controller],
  providers: [BooksV2Service]
})
export class BooksV2Module {}
