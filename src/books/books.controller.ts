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
import { bodyValidationPipe } from '../pipes/body-validation.pipe';
import {
  TCreateBookDTO,
  createBookSchema,
} from './zod-validation/createbooks-zod';
import { QueryValidationPipe } from 'src/pipes/query-validation.pipe';
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
      throw new HttpException('No book found', HttpStatus.NOT_FOUND);
    }
  }

  @Post('create')
  @UsePipes(new bodyValidationPipe(createBookSchema))
  async createBook(@Body() bookPayload: TCreateBookDTO) {
    try {
      return await this.bookService.createBook(bookPayload);
    } catch (error) {
      if (error instanceof Error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
    }
  }
}
