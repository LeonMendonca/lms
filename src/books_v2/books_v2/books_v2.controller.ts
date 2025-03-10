import { Controller, Get, Post, Body, Param, Put, Delete, Query, UsePipes, HttpException, HttpStatus, ParseUUIDPipe } from '@nestjs/common';
import { BooksV2Service } from './books_v2.service';
import { bodyValidationPipe } from 'src/pipes/body-validation.pipe';
import { createBookSchema, TCreateBookZodDTO } from './zod/createbookdtozod';
import { TisbnBookZodDTO } from './zod/isbnbookzod';

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
  @Get('isbn/:isbn')
  async searchBookIsbn(@Param('isbn',)isbn:string,@Body() bookpayload:TisbnBookZodDTO){
try {
  const result= await this.booksService.isbnBook(bookpayload)
  return result;


} catch (error) {
  console.log(error);
  throw new HttpException(error.message, HttpStatus.BAD_REQUEST);

}
  }

  // Create new book
  @Post('create')
  @UsePipes(new bodyValidationPipe(createBookSchema))
  async createBook(@Body() bookPayload:TCreateBookZodDTO) {
    try {
      const result= await this.booksService.createBook(bookPayload);
      return result;
    } catch (error) {
      if (error instanceof Error) {
       console.log(error);
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
    }
  }

 
}