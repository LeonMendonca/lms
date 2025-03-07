import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookCopy } from './entity/books_v2.copies.entity';
import { BookTitle } from './entity/books_v2.title.entity';
import { UpdateBookTitleDTO } from './zod/updatebookdto';
import { UnionBook } from 'src/books/books.query-validator';
import { CreateBookCopyDTO } from './zod/createcopydto';
import { TCreateBookZodDTO } from './zod/createbookdtozod';
import { insertQueryHelper } from 'src/custom-query-helper';

@Injectable()
export class BooksV2Service {
  constructor(
    @InjectRepository(BookCopy)
    private readonly bookcopyRepository: Repository<BookCopy>,

    @InjectRepository(BookTitle)
    private readonly booktitleRepository: Repository<BookTitle>,
  ) { }

  // Find all books
  async getBooks() {
    try {
      return await this.booktitleRepository.query('select * from book_titles inner join book_copies on book_titles.book_uuid = book_copies.book_title_uuid');
    } catch (error) {
      throw new HttpException('Error fetching books', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Find a single book by query (e.g., search by ISBN, title, etc.)
  // async findBookBy(query: UnionBook) {
  //   try {
  //     const book = await this.booktitleRepository.findOne({
  //       where: query, // Use the query as the condition for findOne
  //     });
  //     return book; // return the found book or null
  //   } catch (error) {
  //     throw new HttpException('Error fetching book', HttpStatus.INTERNAL_SERVER_ERROR);
  //   }
  // }

  // Create a new book
  async createBook(createBookpayload: TCreateBookZodDTO) {
    const querydata = insertQueryHelper(createBookpayload, ['source_of_acquisition', 'date_of_acquisition', 'bill_no', 'language', 'inventory_number', 'accession_number', 'barcode', 'item_type', 'institute_id', 'created_by']);
    const bookTitleValid = (await this.booktitleRepository.query(`select * from book_titles where isbn='${createBookpayload.isbn}'`))
    // console.log(bookTitleValid.length);
    if (bookTitleValid.length == 0) {
      const booktitle = this.booktitleRepository.query(`insert into book_titles(${querydata.queryCol})values(${querydata.queryArg})`, querydata.values,);
      console.log("new book generated and data is inserting in book title book");
      const querydata2 = insertQueryHelper(createBookpayload, ['book_title', 'book_author', 'name_of_publisher', 'place_of_publication', 'year_of_publication', 'edition', 'subject', 'department', 'call_number', 'author_mark', 'images', 'additional_fields', 'description', 'no_pages', 'no_preliminary']);
      const bookcopy = this.booktitleRepository.query(`insert into book_copies(${querydata2.queryCol})values(${querydata2.queryArg})`, querydata2.values,);
      console.log("new book");
      const bookisbn: { book_uuid: string; total_count: string; }[] = await this.booktitleRepository.query(`SELECT book_uuid, COUNT(*) OVER (PARTITION BY isbn) AS total_count FROM 
        book_titles WHERE  isbn = '${createBookpayload.isbn}'GROUP BY book_uuid limit 1`)
      const update = this.booktitleRepository.query(`update book_copies set book_title_uuid='${bookisbn[0].book_uuid}' where isbn='${createBookpayload.isbn}'`)
      console.log("new book foreing is getting updated");
      

      // count part is remaining and count is notupdating count is full remaining
      // const bookisbn2: { book_uuid: string; total_count: string; }[] = await this.booktitleRepository.query(`SELECT book_uuid, COUNT(*) OVER (PARTITION BY isbn) AS total_count FROM 
      //   book_titles WHERE  isbn = '${data_isbn2}'GROUP BY book_uuid limit 1`)
      //   const update2= this.booktitleRepository.query(`update book_copies set book_title_uuid='${bookisbn[0].book_uuid}' where isbn='${data_isbn}'`)
      //   console.log("book is available book title book available and total count is updated ");

    }
    const updatecount = await this.booktitleRepository.query(`update book_titles set available_count=available_count+1,total_count=total_count+1 where isbn='${createBookpayload.isbn}' `)
    console.log("book is available count is increasing");

    const querydata2 = insertQueryHelper(createBookpayload, ['book_title', 'book_author', 'name_of_publisher', 'place_of_publication', 'year_of_publication', 'edition', 'subject', 'department', 'call_number', 'author_mark', 'images', 'additional_fields', 'description', 'no_pages', 'no_preliminary']);
    const bookcopy = this.booktitleRepository.query(`insert into book_copies(${querydata2.queryCol})values(${querydata2.queryArg})`, querydata2.values,);
    const data_isbn = createBookpayload.isbn;
    console.log("book is available data inserted in book copies");
    // this is the part
    const bookisbn: { book_uuid: string; total_count: string; }[] = await this.booktitleRepository.query(`SELECT book_uuid, COUNT(*) OVER (PARTITION BY isbn) AS total_count FROM 
    book_titles WHERE  isbn = '${data_isbn}'GROUP BY book_uuid limit 1`)
    const update = this.booktitleRepository.query(`update book_copies set book_title_uuid='${bookisbn[0].book_uuid}' where isbn='${data_isbn}'`)
    console.log("book is available book title book available and total count is updated ");

    const finalresult=await this.booktitleRepository.query(`select * from book_titles where isbn='${createBookpayload.isbn}' `);
    return finalresult;
  }

// change count part count +1 value is not valid use count aggregate functio to get count 
}
