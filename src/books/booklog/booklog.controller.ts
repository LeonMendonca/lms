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
import { Log } from './book.log.entity';
import { TCreateBooklogDTO } from './zod-validation/createbooklog-zod';

@Controller('booklog')
export class BooklogController {
  constructor(private BooklogService: BooklogService) {}

  // @Get('all')
  // async getallBooklogs(){
  //    const result= await this.BooklogService.getBooklog();
  //    return result;

  //    // return Log();
  // }
  @Put('issue/:book_id')
  async createBooklog( @Param('book_id')book_id:string){
    try{
     
      const result = await this.BooklogService.createBooklog(book_id);
      
      return result;
    } catch (error) {
      if (error instanceof Error){
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
    }
  
    }
  
}
