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
import { BooklogService } from './booklog.service';
import { TCreateBookDTO } from 'src/books/zod-validation/createbooks-zod';
import { booklogSchema, TCreateBooklogDTO } from './zod/createbooklog';
import { bodyValidationPipe } from 'src/pipes/body-validation.pipe';
//   import { TCreateBooklogDTO } from './zod-validation/createbooklog-zod';

@Controller('booklog')
export class BooklogController {
  constructor(private BooklogService: BooklogService) {}

  @Get('all')
  async getallBooklogs() {
    const result = await this.BooklogService.getBooklog();
    return result;
  }

  @Post('borrowed')
  @UsePipes(new bodyValidationPipe(booklogSchema))
  async createBooklogissued(@Body() booklogpayload: TCreateBooklogDTO) {
    try {
      const result =
        await this.BooklogService.createBooklogIssued(booklogpayload);
      return result;
    } catch (error) {
      if (error instanceof Error) {
        console.log(error);
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
    }
  }
  @Post('returned')
  async createBooklogreturned(@Body() booklogpayload: TCreateBooklogDTO) {
    try {
      const result =
        await this.BooklogService.createBooklogreturned(booklogpayload);

      return result;
    } catch (error) {
      if (error instanceof Error) {
        console.log(error);
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
    }
  }
  @Post('booklibrary')
  async setBooktoLibrary(@Body() booklogpayload: TCreateBooklogDTO) {
    try {
      const result = await this.BooklogService.setbooklibrary(booklogpayload);
    } catch (error) {}
  }
}
