import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookCopy } from './entity/books_v2.copies.entity'
import { BookTitle } from './entity/books_v2.title.entity';

@Injectable()
export class BooksV2Service {
  constructor(
    @InjectRepository(BookCopy)
    private readonly bookcopyRepository: Repository<BookCopy>,
    @InjectRepository(BookTitle)
    private readonly booktitleRepository: Repository<BookTitle>,  
) {}

  // Find all books
  async findAll(): Promise<BookCopy[]> {
    try {
      return await this.bookRepository.find();
    } catch (error) {
      throw new HttpException('Error fetching books', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Find a single book by ID
  async findOne(id: string): Promise<BookCopy | null> {
    try {
      return await this.bookRepository.findOne(id);
    } catch (error) {
      throw new HttpException('Error fetching book', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Create a new book
  async create(createBookDTO: CreateBookDTO): Promise<BookCopy> {
    const book = this.bookRepository.create(createBookDTO); // Create a new Book instance with the provided DTO

    try {
      return await this.bookRepository.save(book); // Save the book to the database
    } catch (error) {
      throw new HttpException('Error creating book', HttpStatus.BAD_REQUEST);
    }
  }

  // Update an existing book
  async update(id: string, updateBookDTO: UpdateBookDTO): Promise<BookCopy | null> {
    const book = await this.bookRepository.findOne(id);

    if (!book) {
      throw new HttpException('Book not found', HttpStatus.NOT_FOUND);
    }

    // Update the book with new data
    const updatedBook = Object.assign(book, updateBookDTO);

    try {
      return await this.bookRepository.save(updatedBook);
    } catch (error) {
      throw new HttpException('Error updating book', HttpStatus.BAD_REQUEST);
    }
  }

  // Delete a book by ID
  async remove(id: string): Promise<BookCopy | null> {
    const book = await this.bookRepository.findOne(id);

    if (!book) {
      throw new HttpException('Book not found', HttpStatus.NOT_FOUND);
    }

    try {
      await this.bookRepository.remove(book);
      return book; // Return the removed book (or you could just return a success message)
    } catch (error) {
      throw new HttpException('Error deleting book', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
