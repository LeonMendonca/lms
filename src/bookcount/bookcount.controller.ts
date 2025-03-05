import {Body, Controller, Post, UsePipes} from '@nestjs/common';
import {  bookcountQuerySchema, TcreatebookcountQueryValidator } from './zod/createbookscountzod';
import { BookcountService } from './bookcount.service';
import { bodyValidationPipe } from 'src/pipes/body-validation.pipe';
import { TCreateBookDTO } from 'src/books/zod-validation/createbooks-zod';

  @Controller('bookcount')
  export class BookcountController {
      constructor(private BookcountService : BookcountService ) {}
    
    
    @Post('isbn')
    @UsePipes(new bodyValidationPipe(bookcountQuerySchema))
  async  createbookcount(@Body() bookcountpayload:TcreatebookcountQueryValidator, bookcreatepayload:TCreateBookDTO){
      try {
       
           await this.BookcountService.createBookCount(bookcountpayload,bookcreatepayload)
      } catch (error) {
        console.log(error);
        throw error

      }
    }
  }