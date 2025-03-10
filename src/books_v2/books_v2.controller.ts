import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  UsePipes,
  HttpException,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { BooksV2Service } from './books_v2.service';
import { bodyValidationPipe } from 'src/pipes/body-validation.pipe';
import { createBookSchema, TCreateBookZodDTO } from './zod/createbookdtozod';
import { TisbnBookZodDTO } from './zod/isbnbookzod';
import { EMPTY } from 'rxjs';

@Controller('book_v2')
export class BooksV2Controller {
  constructor(private readonly booksService: BooksV2Service) {}

  // Get all books
  @Get('all')
  async getAllBooks(
    @Query('_page') page: string,
    @Query('_limit') limit: string,
    @Query('_search') search: string,
  ) {
    return this.booksService.getBooks({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      search: search ?? undefined,
    });
  }
  @Get('isarchiveT')
  async AllBooksArchiveTrue() {
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
  //   }}//see query for nestjs
  @Get('isbn/:isbn')
  async searchBookIsbn(
    @Param('isbn') isbn: string,
    @Body() bookpayload: TisbnBookZodDTO,
  ) {
    try {
      const result = await this.booksService.isbnBook(isbn, bookpayload);
      return result[0];
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  // Create new book
  @Post('create')
  @UsePipes(new bodyValidationPipe(createBookSchema))
  async createBook(@Body() bookPayload: TCreateBookZodDTO) {
    try {
      const result = await this.booksService.createBook(bookPayload);
      return result;
    } catch (error) {
      if (error instanceof Error) {
        console.log(error);
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
    }
  }
}
