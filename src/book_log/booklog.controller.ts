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
import { TCreateBooklogDTO } from './zod/createbooklog';
//   import { TCreateBooklogDTO } from './zod-validation/createbooklog-zod';
  
  @Controller('booklog')
  export class BooklogController {
    constructor(private BooklogService: BooklogService) {}
  
    // @Get('all')
    // async getallBooklogs(){
    //    const result= await this.BooklogService.getBooklog();
    //    return result;
  
    //    // return Log();
    // }
    @Post('borrowed')
    async createBooklogissued(@Body() booklogpayload:TCreateBooklogDTO ){
      try{
       
        const result = await this.BooklogService.createBooklogIssued(booklogpayload);
        
        return result;
      } catch (error) {
        if (error instanceof Error){
          throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
      }
    
      }
    
  }