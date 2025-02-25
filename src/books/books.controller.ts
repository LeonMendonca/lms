import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UsePipes,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BooksService } from 'src/books/books.service';
import { booksValidationPipe } from './books.pipe';
import {
  TCreateBookDTO,
  createBookSchema,
} from './zod-validation/createbooks-zod';
import { QueryValidationPipe } from 'src/query-validation.pipe';
import { BookQueryValidator } from 'src/books/book.query-validator';
import { bookQuerySchema } from './zod-validation/bookquery-zod';
import type { UnionBook } from './book.types';

@Controller('book')
export class BooksController {
  constructor(private bookService: BooksService) {}

  @Get('all')
  async getAllBooks() {
    return this.bookService.getBooks();
  }

  @Get('search')
  @UsePipes(new QueryValidationPipe(bookQuerySchema, BookQueryValidator))
  async getBookBy(@Query() query: UnionBook) {
    const result = await this.bookService.findBookBy(query);
    if (result.length != 0) {
      return result[0];
    } else {
      throw new HttpException('No user found', HttpStatus.NOT_FOUND);
    }
  }

  @Post('create')
  @UsePipes(new booksValidationPipe(createBookSchema))
  createBook(@Body() bookPayload: TCreateBookDTO) {
    return this.bookService.createBook(bookPayload);
  }
}
