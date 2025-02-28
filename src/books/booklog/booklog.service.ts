import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booklog, ObjectBuilder } from './book.log.entity';
import {Log} from './book.log.entity'
import { insertQueryHelper } from 'src/custom-query-helper';
import { bookQuerySchema } from '../zod-validation/bookquery-zod';
@Injectable()
export class BooklogService {
  constructor(
    @InjectRepository(Booklog)
    private booklogRepository: Repository<Booklog>,
  ) {}

  async getBooklog() {
    const arr = Log();
    return ObjectBuilder(arr)
  }
   async createBooklog(bookTitle:string) {
    try {
      const result= await this.booklogRepository.query(`select book_title from books_table where book_id='${bookTitle}' `);
     //  result 
     if (result === undefined || result.length === 0) {

    }else{

      let queryData=insertQueryHelper(bookQuerySchema)
      
      await this.booklogRepository.query(`insert into book_log (${queryData.queryCol})values( '${queryData.queryArg}') `,queryData.values)
    }
      console.log(result);
    } catch (error) {
      throw error
    }
  
  }


}
// `insert into book_log (book_uuid, book_title,student_id, department,book_status,borrwed_by)values( ) `