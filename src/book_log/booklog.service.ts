import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booklog} from './book_log.entity';
import { insertQueryHelper } from 'src/custom-query-helper';
import { TCreateBookDTO } from 'src/books/zod-validation/createbooks-zod';
import { string } from 'zod';
import { TCreateBooklogDTO } from './zod/createbooklog';
// import { bookQuerySchema } from './zod-validation/bookquery-zod';
@Injectable()
export class BooklogService {
  constructor(
    @InjectRepository(Booklog)
    private booklogRepository: Repository<Booklog>,
  ) {}

  async getBooklog() {
    return await this.booklogRepository.query(`select * from book_log`);
  }
   async createBooklogIssued(booklogpayload: TCreateBooklogDTO) {
    try {
  

  const result: { student_uuid:string; student_name:string; }[] = await this.booklogRepository.query(`select student_uuid from students_table where student_uuid='${booklogpayload.student_uuid}' `)
  const result2: { book_title: string; book_uuid: string }[] = await this.booklogRepository.query(`select book_title, book_uuid from books_table where book_uuid ='${booklogpayload.book_uuid}'`)  
  //  const result:{ student_id:string;book_title: string; book_uuid: string}[] =await this.booklogRepository.query(
   
  // )
console.log()
 if(result.length===0  && result2.length===0){
 console.log('invalid')

 }
//  console.log('it is working ')
const result3=( await this.booklogRepository.query(`insert into book_log(book_title,student_uuid,book_status,book_uuid)values('${result2[0].book_title}','${result[0].student_uuid}','borrowed','${result2[0].book_uuid}') `))
 const result4=(await this.booklogRepository.query(` update book_count set available_count=available_count-1`))
//  insert

    //   let queryData=insertQueryHelper(bookQuerySchema)
      
    // //   await this.booklogRepository.query(insert into book_log (${queryData.queryCol})values( '${queryData.queryArg}') ,queryData.values)
    // }
      console.log(result2);
    } catch (error) {
      console.log(error)
      throw error
  
    }
  
  }


  async createBooklogreturned(booklogpayload: TCreateBooklogDTO) {
    try {
  

  const result: { student_uuid:string; student_name:string; }[] = await this.booklogRepository.query(`select student_uuid from students_table where student_uuid='${booklogpayload.student_uuid}' `)
  const result2: { book_title: string; book_uuid: string }[] = await this.booklogRepository.query(`select book_title, book_uuid from books_table where book_uuid ='${booklogpayload.book_uuid}'`)  
  //  const result:{ student_id:string;book_title: string; book_uuid: string}[] =await this.booklogRepository.query(
   
  // )
console.log()
 if(result.length===0  && result2.length===0){
 console.log('invalid')

 }
//  console.log('it is working ')
const result3=( await this.booklogRepository.query(`insert into book_log(book_title,student_uuid,book_status,book_uuid)values('${result2[0].book_title}','${result[0].student_uuid}','returned','${result2[0].book_uuid}') `))
 const result4=(await this.booklogRepository.query(` update book_count set available_count=available_count+1`))
//  insert

    //   let queryData=insertQueryHelper(bookQuerySchema)
      
    // //   await this.booklogRepository.query(insert into book_log (${queryData.queryCol})values( '${queryData.queryArg}') ,queryData.values)
    // }
      console.log(result2);
    } catch (error) {
      console.log(error)
      throw error
  
    }
  
  }

}
// `insert into book_log (book_uuid, book_title,student_id, department,book_status,borrwed_by)values( ) `