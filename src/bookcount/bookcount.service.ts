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
  ) { }

  async createBookCount(bookcountpayload: TcreatebookcountQueryValidator, bookcreatepayload: TCreateBookDTO) {
    // const result:{count:string; book_title:string;book_author:string;name_of_publisher:string;place_of_publication:string; year_of_publication:string;edition:string; isbn:string; no_of_pages:string;no_of_preliminary_pages:string;subject:string;department:string;call_number:string;author_mark:string; source_of_acquisition:string;date_of_acquisition:string;bill_no:string;inventory_number:string;accession_number:string;barcode:string;item_type:string;institute_id:string;is_archived:string;}[]= await this.bookcountRepository.query(`
    //   select count(isbn) as count ,book_title,book_author,name_of_publisher,place_of_publication,year_of_publication,edition,isbn,no_of_pages,no_of_preliminary_pages,subject,department,call_number,author_mark,source_of_acquisition,date_of_acquisition,bill_no,inventory_number,accession_number,barcode,item_type,institute_id,is_archived from books_table where isbn=${bookcountpayload.isbn};
    //   `)

    // book is available with isbn part 
    const available_in_book_table = (
      await this.bookcountRepository.query(`select *  from books_table where isbn='${bookcountpayload.isbn}'`)
    )
    if (available_in_book_table.length == 0) {

      message: "no book available"
    }
    else {
      // fetching all the data from book table
      const result: {
        count: string;
        book_title: string;
        book_author: string;
        name_of_publisher: string;
        place_of_publication: string;
        year_of_publication: string;  // Date string in 'YYYY-MM-DD' format
        edition: string;
        isbn: string;
        no_of_pages: string;
        no_of_preliminary_pages: string;
        subject: string;
        department: string;
        call_number: string;
        author_mark: string;
        source_of_acquisition: string;
        date_of_acquisition: string;  // Date string in 'YYYY-MM-DD' format
        bill_no: string;
        inventory_number: string;
        accession_number: string;
        barcode: string;
        item_type: string;
        institute_id: string;
        is_archived: string;
        language:string;
      }[] = await this.bookcountRepository.query(`
      SELECT 
        count(isbn) as count,
        book_title,
        book_author,
        name_of_publisher,
        place_of_publication,
        TO_CHAR(year_of_publication, 'YYYY-MM-DD') AS year_of_publication,  -- Formatted date
        edition,
        isbn,
        no_of_pages,
        no_of_preliminary_pages,
        subject,
        department,
        call_number,
        author_mark,
        source_of_acquisition,
        TO_CHAR(date_of_acquisition, 'YYYY-MM-DD') AS date_of_acquisition,  -- Formatted date
        bill_no,
        inventory_number,
        accession_number,
        barcode,
        item_type,
        institute_id,
        is_archived ,
        language
        

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
        is_archived,
        language;
    `, [bookcountpayload.isbn]);
      console.log(result)

      result[0].count=result[0].count+1;
// insert all the data
        const result2 = await this.bookcountRepository.query(`
        INSERT INTO books_table (
          available_count,
          total_count,
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
          bill_no,
          inventory_number,
          accession_number,
          barcode,
          item_type,
          institute_id,
          is_archived,
          language,
          date_of_acquisition
        )
        VALUES (
          ${result[0].count},
          ${result[0].count},
          '${result[0].book_title}',
          '${result[0].book_author}',
          '${result[0].name_of_publisher}',
          '${result[0].place_of_publication}',
          '${new Date(result[0].year_of_publication).toISOString().split('T')[0]}',  -- Formatted year_of_publication
          '${result[0].edition}',
          '${result[0].isbn}',
          ${result[0].no_of_pages},
          ${result[0].no_of_preliminary_pages},
          '${result[0].subject}',
          '${result[0].department}',
          '${result[0].call_number}',
          '${result[0].author_mark}',
          '${result[0].source_of_acquisition}',  -- Added missing comma here
          '${result[0].bill_no}',
          '${result[0].inventory_number}',
          '${result[0].accession_number}',
          '${result[0].barcode}',
          '${result[0].item_type}',
          '${result[0].institute_id}',
          '${result[0].is_archived}',
          '${result[0].language}',
          '${result[0].date_of_acquisition}'
        );
      `);

    

//bookcount part if isbn is ther i book table but it is not in book_count it will be inserted
      const result4 = await this.bookcountRepository.query(`select isbn from book_count where isbn='${bookcountpayload.isbn}' limit 1`)
      if (result4.length == 0) {
        const result3 = await this.bookcountRepository.query(`insert into book_count(isbn,version,book_title,available_count) values('${result[0].isbn}','${result[0].edition}','${result[0].book_title}',${result[0].count});`)
      }
      //if book is available in book_count then available count will increased by 1
      else {
        const result5 = await this.bookcountRepository.query(`update book_count set available_count=available_count+1 `)
      }

    }


    //book count insert part
    // const result4=await this.bookcountRepository.query(`select count(isbn)  from books_table where isbn='${bookcountpayload.isbn}'`)

    //  console.log(result4)
    // await this.bookcountRepository.query
    //     let querydata=insertQueryHelper(bookcreatepayload,[])
    //    const result2= await this.bookcountRepository.query(`insert into book_table(${querydata.queryCol}) values(${querydata.queryArg})`,querydata.values )
    //     // const result= await this.bookcountRepository.query(``)
    //     //   console.log(result)
    //       console.log(result2);
    //   await this.bookcountRepository.query(`update set available_count= result.count from book_count where isbn={this.bookcountRepository} `);

  }

}
// the count will be increased on basis of typeorm foreing key
