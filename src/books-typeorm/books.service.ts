import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Books } from './books.entity';
import { CreateBookDTO } from './zod-validation/createbooks-zod';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Books)
    private booksRepository: Repository<Books>,
  ) {}
  async getBooks() {
    return await this.booksRepository.find();
  }
  createBook(bookPayload: CreateBookDTO) {
    console.log(...Object.values(bookPayload));
    this.booksRepository.query(
      `INSERT INTO books_table (book_title, book_author, name_of_publisher, place_of_publication, year_of_publication, language, edition, isbn, no_of_pages, no_of_preliminary_pages, subject, department, call_number, author_mark, source_of_acquisition, date_of_acquisition, inventory_number, accession_number, barcode, item_type, bill_no ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)`,
      [
        bookPayload.book_title,
        bookPayload.book_author,
        bookPayload.name_of_publisher,
        bookPayload.place_of_publication,
        bookPayload.year_of_publication,
        bookPayload.language,
        bookPayload.edition,
        bookPayload.isbn,
        bookPayload.no_of_pages,
        bookPayload.no_of_preliminary_pages,
        bookPayload.subject,
        bookPayload.department,
        bookPayload.call_number,
        bookPayload.author_mark,
        bookPayload.source_of_acquisition,
        bookPayload.date_of_acquisition,
        bookPayload.inventory_number,
        bookPayload.accession_number,
        bookPayload.barcode,
        bookPayload.item_type,
        bookPayload.bill_no
      ],
    );
    return 'Inserted!!';
  }
}
