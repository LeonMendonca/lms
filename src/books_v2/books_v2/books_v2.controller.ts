import { Controller, Get, Post, Body, Param, Put, Delete, Query, UsePipes, HttpException, HttpStatus, ParseUUIDPipe } from '@nestjs/common';
import { BooksV2Service } from './books_v2.service';
import { QueryValidationPipe } from 'src/pipes/query-validation.pipe';
import { bookQuerySchema } from 'src/books/zod-validation/bookquery-zod';
import { BookQueryValidator, UnionBook } from 'src/books/books.query-validator';
import { bodyValidationPipe } from 'src/pipes/body-validation.pipe';
// import { createBookSchema, TCreateBookDTO } from 'src/books/zod-validation/createbooks-zod';

import { CreateBookCopyDTO } from './zod/createcopydto';
import { createBookSchema, TCreateBookZodDTO } from './zod/createbookdtozod';

@Controller('book_v2')
export class BooksV2Controller {
  constructor(private readonly booksService: BooksV2Service,) {}

  // Get all books
  @Get('all')
  async getAllBooks() {
    return this.booksService.getBooks();
  }

  // @Get('search')
  // //@UsePipes(new QueryValidationPipe(bookQuerySchema)) // Ensure the schema is passed correctly
  // async getBookBy(@Query() query: UnionBook) {
  //   const result = await this.booksService.findBookBy(query);

  //   if (result) {
  //     return result;
  //   } else {
  //     throw new HttpException('No book found', HttpStatus.NOT_FOUND);
  //   }}

  // Create new book
  @Post('create')
  @UsePipes(new bodyValidationPipe(createBookSchema))
  async createBook(@Body() bookPayload:TCreateBookZodDTO) {
    try {
      const result= await this.booksService.createBook(bookPayload);
      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
    }
  }
  //https://github.com/Aspireve/lms/tree/master/src steve done it
}