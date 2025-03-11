import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Books } from './books.entity';
import type { TCreateBookDTO } from './zod-validation/createbooks-zod';
import type { UnionBook } from './books.query-validator';
import { BookQueryValidator } from './books.query-validator';
import { insertQueryHelper, updateQueryHelper } from '../custom-query-helper';
import { TEditBookDTO } from './zod-validation/putbook-zod';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Books)
    private booksRepository: Repository<Books>,
  ) { }

  async getBooks() {
    return await this.booksRepository.query(
      'SELECT * from books_table WHERE is_archived = false AND available_count > 0',
    );
  }

  async findBookBy(query: UnionBook) {
    let requiredKey: keyof typeof BookQueryValidator | undefined = undefined;
    let value: string | number | undefined = undefined;
    if ('book_uuid' in query) {
      requiredKey = 'book_uuid';
      value = query.book_uuid;
    } else if ('book_title' in query) {
      requiredKey = 'book_title';
      value = query.book_title;
    } else if ('book_author' in query) {
      requiredKey = 'book_author';
      value = query.book_author;
    } else {
      requiredKey = 'isbn';
      value = query.isbn;
    }
    return (await this.booksRepository.query(
      `SELECT * FROM books_table WHERE ${requiredKey} = $1 AND is_archived = false AND available_count > 0`,
      [value],
    )) as Books[];
  }

  async createBook(bookPayload: TCreateBookDTO) {
    try {
      const result: [[], number] = await this.booksRepository.query(
        `UPDATE books_table SET total_count = total_count + 1, available_count = available_count + 1 WHERE book_title = '${bookPayload.book_title}' AND book_author = '${bookPayload.book_author}' AND is_archived = false`,
      );
      if (!result[1]) {
        let queryData = insertQueryHelper(bookPayload, []);
        await this.booksRepository.query(
          `INSERT INTO books_table (${queryData.queryCol}) values (${queryData.queryArg})`,
          queryData.values,
        );
      }
      return {
        statusCode: HttpStatus.CREATED,
        isbn: bookPayload.isbn,
        title: bookPayload.book_title
      };
    } catch (error) {
      throw error;
    }
  }

  async updateBook(bookId: string, editBookPayload: TEditBookDTO) {
    try {
      let queryData = updateQueryHelper<TEditBookDTO>(editBookPayload, []);
      const result = await this.booksRepository.query(
        `
      UPDATE books_table SET ${queryData.queryCol} WHERE book_id = '${bookId}' AND is_archived = false AND available_count > 0
    `,
        queryData.values,
      );
      return result as [[], number];
    } catch (error) {
      throw error;
    }
  }

  async deleteBook(bookId: string) {
    try {
      const result = await this.booksRepository.query(
        `
      UPDATE books_table SET is_archived = true WHERE book_id = '${bookId}' AND is_archived = false
    `,
      );
      return result as [[], number];
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
