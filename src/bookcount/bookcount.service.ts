import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bookcount } from './bookcount.entity';
import { TCreateBookDTO } from 'src/books/zod-validation/createbooks-zod';
import { TcreatebookcountQueryValidator } from './zod/createbookscountzod';
import { insertQueryHelper } from 'src/custom-query-helper';
@Injectable()
export class BookcountService {
  constructor(
    @InjectRepository(Bookcount)
    private bookcountRepository: Repository<Bookcount>,
  ) {}

  async createBookCount(bookcountpayload:TcreatebookcountQueryValidator,bookcreatepayload:TCreateBookDTO){
    // const result:{count:string; book_title:string;book_author:string;name_of_publisher:string;place_of_publication:string; year_of_publication:string;edition:string; isbn:string; no_of_pages:string;no_of_preliminary_pages:string;subject:string;department:string;call_number:string;author_mark:string; source_of_acquisition:string;date_of_acquisition:string;bill_no:string;inventory_number:string;accession_number:string;barcode:string;item_type:string;institute_id:string;is_archived:string;}[]= await this.bookcountRepository.query(`
    //   select count(isbn) as count ,book_title,book_author,name_of_publisher,place_of_publication,year_of_publication,edition,isbn,no_of_pages,no_of_preliminary_pages,subject,department,call_number,author_mark,source_of_acquisition,date_of_acquisition,bill_no,inventory_number,accession_number,barcode,item_type,institute_id,is_archived from books_table where isbn=${bookcountpayload.isbn};
    //   `)

    const result: { 
      count: string;
      book_title: string;
      book_author: string;
      name_of_publisher: string;
      place_of_publication: string;
      year_of_publication: string;
      edition: string;
      isbn: string;
      no_of_pages: string;
      no_of_preliminary_pages: string;
      subject: string;
      department: string;
      call_number: string;
      author_mark: string;
      source_of_acquisition: string;
      date_of_acquisition: string;
      bill_no: string;
      inventory_number: string;
      accession_number: string;
      barcode: string;
      item_type: string;
      institute_id: string;
      is_archived: string;
    }[] = await this.bookcountRepository.query(`
      SELECT 
        count(isbn) as count,
        book_title,
        book_author,
        name_of_publisher,
        place_of_publication,
        year_of_publication,
        edition,
        isbn,
        no_of_pages,
        no_of_preliminary_pages,
        subject,
        department,
        call_number,
        author_mark,
        source_of_acquisition,
        date_of_acquisition,
        bill_no,
        inventory_number,
        accession_number,
        barcode,
        item_type,
        institute_id,
        is_archived 
      FROM books_table 
      WHERE isbn = $1
      GROUP BY
        book_title,
        book_author,
        name_of_publisher,
        place_of_publication,
        year_of_publication,
        edition,
        isbn,
        no_of_pages,
        no_of_preliminary_pages,
        subject,
        department,
        call_number,
        author_mark,
        source_of_acquisition,
        date_of_acquisition,
        bill_no,
        inventory_number,
        accession_number,
        barcode,
        item_type,
        institute_id,
        is_archived;
    `, [bookcountpayload.isbn]);
    console.log(result);
await this.bookcountRepository.query
    let querydata=insertQueryHelper(bookcreatepayload,[])
   const result2= await this.bookcountRepository.query(` insert into book_table(${querydata.queryCol}) values(${querydata.queryArg})`,querydata.values )
    // const result= await this.bookcountRepository.query(``)
    //   console.log(result)
      console.log(result2);
    //   await this.bookcountRepository.query(`update set available_count= result.count from book_count where isbn={this.bookcountRepository} `);
  }
  
}
