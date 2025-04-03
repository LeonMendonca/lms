import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UsePipes,
  HttpException,
  HttpStatus,
  Put,
  Param,
  ParseUUIDPipe,
  Delete,
} from '@nestjs/common';
import { BooksService } from 'src/books/books.service';
import { bodyValidationPipe } from '../pipes/body-validation.pipe';
import {
  TCreateBookDTO,
  createBookSchema,
} from './zod-validation/createbooks-zod';
import { QueryValidationPipe } from 'src/pipes/query-validation.pipe';
import { BookQueryValidator } from 'src/books/books.query-validator';
import { bookQuerySchema } from './zod-validation/bookquery-zod';
import type { UnionBook } from './books.query-validator';
import { putBodyValidationPipe } from 'src/pipes/put-body-validation.pipe';
import { editBookSchema, TEditBookDTO } from './zod-validation/putbook-zod';

@Controller('book')
export class BooksController {
  constructor(private bookService: BooksService) { }

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

  @Put('edit/:book_id')
  @UsePipes(new putBodyValidationPipe(editBookSchema))
  async updateBook(
    @Param(
      'book_id',
      new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    bookId: string,
    @Body() bookPayload: TEditBookDTO,
  ) {
    try {
      const result = await this.bookService.updateBook(bookId, bookPayload);
      if (result[1]) {
        return {
          statusCode: HttpStatus.OK,
          message: `Book id ${bookId} updated successfully!`,
        };
      } else {
        throw new Error(`Book with id ${bookId} not found`);
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }


  @Delete('delete/:book_id')
  async deleteBook(
    @Param(
      'book_id',
      new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    bookId: string,
  ) {
    try {
      const result = await this.bookService.deleteBook(bookId);
      if (result[1]) {
        return {
          statusCode: HttpStatus.OK,
          message: `Book id ${bookId} deleted successfully!`,
        };
      } else {
        throw new Error(`Book with id ${bookId} not found`);
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
