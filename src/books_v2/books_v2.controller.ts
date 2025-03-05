import { Controller, Get, Post, Body, Param, Put, Delete, Query, UsePipes, HttpException, HttpStatus, ParseUUIDPipe } from '@nestjs/common';
import { BooksV2Service } from './books_v2.service';
import { QueryValidationPipe } from 'src/pipes/query-validation.pipe';
import { bookQuerySchema } from 'src/books/zod-validation/bookquery-zod';
import { BookQueryValidator, UnionBook } from 'src/books/books.query-validator';
import { bodyValidationPipe } from 'src/pipes/body-validation.pipe';
import { createBookSchema, TCreateBookDTO } from 'src/books/zod-validation/createbooks-zod';

@Controller('books-v2')
export class BooksV2Controller {
  constructor(private readonly booksService: BooksV2Service,) {}

  // Get all books
  @Get('all')
  async getAllBooks() {
    return this.booksService.getBooks();
  }

    @Get('search')
  @UsePipes(new QueryValidationPipe(bookQuerySchema, BookQueryValidator))
  async getBookBy(@Query() query: UnionBook) {
    const result = await this.booksService.findBookBy(query);
    if (result.length != 0) {
      return result[0];
    } else {
      throw new HttpException('No book found', HttpStatus.NOT_FOUND);
    }
  }

  // Create new book
  @Post('create')
  @UsePipes(new bodyValidationPipe(createBookSchema))
  async createBook(@Body() bookPayload: TCreateBookDTO) {
    try {
      return await this.booksService.createBook(bookPayload);
    } catch (error) {
      if (error instanceof Error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
    }
  }

} 