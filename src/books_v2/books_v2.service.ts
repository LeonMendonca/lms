import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookCopy } from './entity/books_v2.copies.entity'
import { BookTitle } from './entity/books_v2.title.entity';
import { CreateBookTitleDTO } from './createbookdto';

@Injectable()
export class BooksV2Service {
  constructor(
    @InjectRepository(BookCopy)
    private readonly bookcopyRepository: Repository<BookCopy>,
    @InjectRepository(BookTitle)
    private readonly booktitleRepository: Repository<BookTitle>,  
) {}

  // Find all books
  async findAll(createBookpayload:CreateBookTitleDTO){
    try {
      return await this.bookcopyRepository.find();
    } catch (error) {
      throw new HttpException('Error fetching books', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Find a single book by ID
  async findOne(createBookpayload:CreateBookTitleDTO){
    try {
      return await this.bookcopyRepository.findOne(id);
    } catch (error) {
      throw new HttpException('Error fetching book', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Create a new book
  async create(createBookpayload:CreateBookTitleDTO) {
    const book = this.bookcopyRepository.create(createBookDTO); // Create a new Book instance with the provided DTO

    try {
      return await this.bookcopyRepository.save(book); // Save the book to the database
    } catch (error) {
      throw new HttpException('Error creating book', HttpStatus.BAD_REQUEST);
    }
  }

  // Update an existing book
  async update(id: string, updateBookDTO: UpdateBookDTO): {
    const book = await this.bookcopyRepository.findOne(id);

    if (!book) {
      throw new HttpException('Book not found', HttpStatus.NOT_FOUND);
    }

    // Update the book with new data
    const updatedBook = Object.assign(book, updateBookDTO);

    try {
      return await this.bookcopyRepository.save(updatedBook);
    } catch (error) {
      throw new HttpException('Error updating book', HttpStatus.BAD_REQUEST);
    }
  }

  // Delete a book by ID
  async remove(id: string) {
    const book = await this.bookcopyRepository.findOne(id);

    if (!book) {
      throw new HttpException('Book not found', HttpStatus.NOT_FOUND);
    }

    try {
      await this.bookcopyRepository.remove(book);
      return book; // Return the removed book (or you could just return a success message)
    } catch (error) {
      throw new HttpException('Error deleting book', HttpStatus.INTERNAL_SERVER_ERROR);
    }
   
    
    async findAllbooktitle() {
        try {
          return await this.bookTitleRepository.find({ relations: ['bookCopies'] }); // Including the bookCopies relation
        } catch (error) {
          throw new HttpException('Error fetching book titles', HttpStatus.INTERNAL_SERVER_ERROR);
        }
      }

      async findOne(bookUUID: string) {
        try {
          const bookTitle = await this.bookTitleRepository.findOne(bookUUID, { relations: ['bookCopies'] });
          if (!bookTitle) {
            throw new HttpException('Book title not found', HttpStatus.NOT_FOUND);
          }
          return bookTitle;
        } catch (error) {
          throw new HttpException('Error fetching book title', HttpStatus.INTERNAL_SERVER_ERROR);
        }
      }
    
      // Create a new book title
      async create(createBookTitleDTO: CreateBookTitleDTO) {
        const bookTitle = this.bookTitleRepository.create(createBookTitleDTO);
    
        try {
          return await this.bookTitleRepository.save(bookTitle);
        } catch (error) {
          throw new HttpException('Error creating book title', HttpStatus.BAD_REQUEST);
        }
      }
    
      // Update a book title
      async update(bookUUID: string, updateBookTitleDTO: UpdateBookTitleDTO) {
        const bookTitle = await this.bookTitleRepository.findOne(bookUUID);
        if (!bookTitle) {
          throw new HttpException('Book title not found', HttpStatus.NOT_FOUND);
        }
    
        const updatedBookTitle = Object.assign(bookTitle, updateBookTitleDTO);
    
        try {
          return await this.bookTitleRepository.save(updatedBookTitle);
        } catch (error) {
          throw new HttpException('Error updating book title', HttpStatus.BAD_REQUEST);
        }
      }
    
      // Delete a book title
      async remove(bookUUID: string) {
        const bookTitle = await this.bookTitleRepository.findOne(bookUUID);
        if (!bookTitle) {
          throw new HttpException('Book title not found', HttpStatus.NOT_FOUND);
        }
    
        try {
          await this.bookTitleRepository.remove(bookTitle);
          return bookTitle;
        } catch (error) {
          throw new HttpException('Error deleting book title', HttpStatus.INTERNAL_SERVER_ERROR);
        }
      }
    }

    
    
  }
}
