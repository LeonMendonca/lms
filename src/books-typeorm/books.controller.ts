import { Controller, Get, Post, Body, UsePipes } from '@nestjs/common';
import { BooksService } from 'src/books-typeorm/books.service';
import { booksValidationPipe } from './books.pipe';
import { createBookDTO } from './dto/createbooks-dto';
import { createBookSchema } from './zod-validation/createbooks-zod';

@Controller('book')
export class BooksController {
  constructor(private bookService: BooksService) {}

  @Get('all')
  async getAllBooks() {
    return this.bookService.getBooks();
  }

  @Post('create')
  @UsePipes(new booksValidationPipe(createBookSchema))
  createBook(@Body() bookPayload: createBookDTO) {
    console.log('transformed payload', bookPayload);
    return this.bookService.createBook(bookPayload);
  }
}
