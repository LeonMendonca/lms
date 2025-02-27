import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Books } from './books.entity';
import type { TCreateBookDTO } from './zod-validation/createbooks-zod';
import type { UnionBook } from './book.types';
import { BookQueryValidator } from './book.query-validator';
import { insertQueryHelper } from '../custom-query-helper';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Books)
    private booksRepository: Repository<Books>,
  ) {}
  async getBooks() {
    return await this.booksRepository.query('SELECT * from books_table');
  }

  async findBookBy(query: UnionBook) {
    let requiredKey: keyof typeof BookQueryValidator | undefined = undefined;
    let value: string | number | undefined = undefined;
    if ('book_id' in query) {
      requiredKey = 'book_id';
      value = query.book_id;
    } else if ('book_title' in query) {
      requiredKey = 'book_title';
      value = query.book_title;
    } else if ('book_author' in query) {
      requiredKey = 'book_author';
      value = query.book_author;
    } else {
      //error if NaN
      requiredKey = 'bill_no';
      value = query.bill_no;
    }
    return (await this.booksRepository.query(
      `SELECT * FROM books_table WHERE ${requiredKey} = $1`,
      [value],
    )) as Books[];
  }

  async createBook(bookPayload: TCreateBookDTO) {
    try {
      let queryData = insertQueryHelper(bookPayload);
      await this.booksRepository.query(
        `INSERT INTO books_table (${queryData.queryCol}) values (${queryData.queryArg})`,
        queryData.values,
      );
      return 'Inserted!!';
    } catch (error) {
      throw error;
    }
  }
}

//INSERT TRIAL DATA
// {
//   "book_title": "Introduction to Machine Learning",
//   "book_author": "aaaa",
//   "name_of_publisher": "Oxford University Press",
//   "place_of_publication": "Oxford, United Kingdom",
//   "year_of_publication": "2023-05-09",
//   "language": "English",
//   "edition": "3rd Edition",
//   "isbn": "978-0198831023",
//   "no_of_pages": 450,
//   "no_of_preliminary_pages": 15,
//   "subject": "Computer Science",
//   "department": "Computer Science and Engineering",
//   "call_number": "1234567890",
//   "author_mark": "A1",
//   "source_of_acquisition": "University Bookstore",
//   "date_of_acquisition": "2023-06-09",
//   "bill_no": 1001,
//   "inventory_number": 57824,
//   "accession_number": 1003,
//   "barcode": "1234567890123",
//   "item_type": "Textbook",
//   "institute_id": "47ec109e-7100-4a0f-91d7-4a3da36d3dc6"
// }
