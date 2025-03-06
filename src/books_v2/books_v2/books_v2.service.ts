import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookCopy } from './entity/books_v2.copies.entity';
import { BookTitle } from './entity/books_v2.title.entity';
import { UpdateBookTitleDTO } from './dto/updatebookdto';
import { UnionBook } from 'src/books/books.query-validator';

@Injectable()
export class BooksV2Service {
  constructor(
    @InjectRepository(BookCopy)
    private readonly bookcopyRepository: Repository<BookCopy>,

    @InjectRepository(BookTitle)
    private readonly booktitleRepository: Repository<BookTitle>,
  ) {}

  // Find all books
  async getBooks() {
    try {
      return await this.booktitleRepository.query('SELECT * FROM book_titles');
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
  // async createBook(createBookpayload: Create) {
  //   const book = this.bookcopyRepository.create(createBookpayload); // Create a new Book instance with the provided DTO

  //   try {
  //     return await this.bookcopyRepository.save(book); // Save the book to the database
  //   } catch (error) {
  //     throw new HttpException('Error creating book', HttpStatus.BAD_REQUEST);
  //   }
  // }

  
}
