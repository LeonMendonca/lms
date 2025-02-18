import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
  HttpStatus,
  HttpCode,
  HttpException,
} from '@nestjs/common';
import { BookService } from './books.service';
import { AddBookDTO } from './dtos/addBook.dto';
import { EditBookDTO } from './dtos/editBook.dto';
@Controller('books')
export class BookController {
  constructor(private bookService: BookService) {}

  @Get('view-books')
  async allBooks(@Query('book_borrowed') query: string) {
    try {
      if (query) {
        const queryBoolean = JSON.parse(query) as boolean;
        return await this.bookService.allBooks(queryBoolean);
      } else {
        return await this.bookService.allBooks();
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
    }
  }

  @Post('add-book')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.CREATED)
  addBook(@Body() addBookDTO: AddBookDTO) {
    return this.bookService.addBook(addBookDTO);
  }

  @Put('update-book')
  updateBook(@Query('id') id: string, @Body() bookPayload: typeof EditBookDTO) {
    if (!id) {
      throw new HttpException('id is required!', HttpStatus.BAD_REQUEST);
    }
    if (!bookPayload) {
      throw new HttpException('Payload is required!', HttpStatus.BAD_REQUEST);
    }
    {
      return this.bookService.updateBook(id, bookPayload);
    }
  }
}
