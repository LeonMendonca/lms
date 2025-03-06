import { Injectable, HttpException, HttpStatus, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { BookCopy } from './entity/books_v2.copies.entity';
import { BookTitle } from './entity/books_v2.title.entity';
// import { CreateBookTitleDTO } from './dto/createbookdto';
import { UpdateBookCopyDTO, UpdateBookTitleDTO } from './dto/updatebookdto';
import { UnionBook } from 'src/books/books.query-validator';
import { CreateBookCopyDTO } from './dto/createbookv2dto';

@Injectable()
export class BooksV2Service {
  constructor(
    @InjectRepository(BookCopy)
    private readonly bookcopyRepository: Repository<BookCopy>,
    @InjectRepository(BookTitle)
    private readonly booktitleRepository: Repository<BookTitle>,
  ) {}

  // Find all books
  async getBooks(searchQuery: string) {
    try {
      const whereConditions: any = { isArchived: false };
      if (searchQuery) {
        whereConditions.bookTitle = ILike(`%${searchQuery}%`);
      }
      return await this.booktitleRepository.find({
        where: whereConditions,
      });
    } catch (error) {
      console.error('Error fetching books:', error);
      throw new HttpException(
        'Error fetching books',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getBookTitleByISBN(isbn: string) {
    try {
      const whereConditions: any = { isArchived: false };
      if (isbn) {
        whereConditions.isbn = isbn;
      }
      return await this.booktitleRepository.find({
        where: whereConditions,
      });
    } catch (error) {
      console.error('Error fetching books:', error);
      throw new HttpException(
        'Error fetching books',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Find a single book by ID
  async findBookBy(query: UnionBook) {
    try {
      const book = await this.booktitleRepository.findOne({
        where: query as any,
      });
      return book;
    } catch (error) {
      throw new HttpException(
        'Error fetching book',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Create a new book
  async createBook(createBookPayload: CreateBookCopyDTO) {
    try {
      let bookTitleData = await this.booktitleRepository.findOne({
        where: { isbn: createBookPayload.isbn as any },
        relations: ['bookCopies'], // Ensure bookCopies are loaded
      });

      if (bookTitleData) {
        // If book exists, update total and available count
        bookTitleData.totalCount += 1;
        bookTitleData.availableCount += 1;
      } else {
        // Create new book title entry
        bookTitleData = this.booktitleRepository.create({
          bookId: createBookPayload.bookId,
          bookTitle: createBookPayload.bookTitle,
          bookAuthor: createBookPayload.bookAuthor,
          nameOfPublisher: createBookPayload.nameOfPublisher,
          placeOfPublication: createBookPayload.placeOfPublication,
          yearOfPublication: createBookPayload.yearOfPublication,
          edition: createBookPayload.edition,
          isbn: createBookPayload.isbn,
          subject: createBookPayload.subject,
          department: createBookPayload.department,
          callNumber: createBookPayload.callNumber,
          authorMark: createBookPayload.authorMark,
          totalCount: 1, // First copy
          availableCount: 1,
          createdBy: 'f3b6c2a4-8e19-4f8d-b9f6-4e5d5b3c7a21',
          remarks: createBookPayload.remarks,
          images: createBookPayload.images,
          additionalFields: createBookPayload.additionalFields,
          description: createBookPayload.description,
          bookCopies: [], // Initialize empty array
        });

        bookTitleData = await this.booktitleRepository.save(bookTitleData);
      }

      // Create new book copy
      const bookCopy: BookCopy = this.bookcopyRepository.create({
        sourceOfAcquisition: createBookPayload.sourceOfAcquisition,
        dateOfAcquisition: createBookPayload.dateOfAcquisition,
        billNo: createBookPayload.billNo,
        noOfPages: createBookPayload.noOfPages,
        noOfPreliminaryPages: createBookPayload.noOfPreliminaryPages,
        language: createBookPayload.language,
        inventoryNumber: createBookPayload.inventoryNumber,
        accessionNumber: createBookPayload.accessionNumber,
        barcode: createBookPayload.barcode,
        itemType: createBookPayload.itemType,
        instituteId: createBookPayload.instituteId,
        createdBy: 'f3b6c2a4-8e19-4f8d-b9f6-4e5d5b3c7a21',
        remarks: createBookPayload.remarks,
        images: createBookPayload.images,
        additionalFields: createBookPayload.additionalFields,
        description: createBookPayload.description,
        bookTitle: bookTitleData, // Associate with book title
      });

      const savedBookCopy = await this.bookcopyRepository.save(bookCopy);

      // Add saved book copy to bookTitleData.bookCopies and update the book title
      bookTitleData.bookCopies.push(savedBookCopy);
      await this.booktitleRepository.save(bookTitleData);

      return savedBookCopy;
    } catch (error) {
      console.error('Error creating book:', error);
      throw new HttpException('Error creating book', HttpStatus.BAD_REQUEST);
    }
  }

  async archiveBookTitle(id: string) {
    try {
      const book = await this.booktitleRepository.findOne({
        where: { bookId: id },
      });

      if (!book) {
        throw new HttpException('Book not found', HttpStatus.NOT_FOUND);
      }

      book.isArchived = true;
      await this.booktitleRepository.save(book);

      return { message: 'Book archived successfully' };
    } catch (error) {
      throw new HttpException('Error archiving book', HttpStatus.BAD_REQUEST);
    }
  }

  async getArchivedBookTitle() {
    try {
      return await this.booktitleRepository.find({
        where: { isArchived: true },
      });
    } catch (error) {
      throw new HttpException(
        'Error fetching archived books',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async restoreBookTitle(id: string) {
    try {
      const book = await this.booktitleRepository.findOne({
        where: { bookId: id, isArchived: true },
      });

      if (!book) {
        throw new HttpException(
          'Archived book not found',
          HttpStatus.NOT_FOUND,
        );
      }

      book.isArchived = false;
      await this.booktitleRepository.save(book);

      return { message: 'Book restored successfully' };
    } catch (error) {
      throw new HttpException('Error restoring book', HttpStatus.BAD_REQUEST);
    }
  }

  async updateBookTitle(id: string, updateBookPayload: UpdateBookTitleDTO) {
    try {
      const book = await this.booktitleRepository.findOne({
        where: { bookId: id },
      });

      if (!book) {
        throw new HttpException('Book not found', HttpStatus.NOT_FOUND);
      }

      await this.booktitleRepository.update(id, updateBookPayload);

      return { message: 'Book updated successfully' };
    } catch (error) {
      throw new HttpException('Error updating book', HttpStatus.BAD_REQUEST);
    }
  }

  async getBookCopyDetails(id: string, searchQuery: string) {
    try {
      // Base condition to filter book copies (not archived)
      const whereConditions: any = { isArchived: false };

      // If an ID is provided, add it to the filter
      if (id) {
        whereConditions.bookCopyUUID = id;
      }

      // If a search query is provided, search in relevant fields
      if (searchQuery) {
        whereConditions.bookTitle = ILike(`%${searchQuery}%`);
      }

      const bookCopy = await this.bookcopyRepository.findOne({
        where: whereConditions,
      });

      if (!bookCopy) {
        throw new HttpException('Book copy not found', HttpStatus.NOT_FOUND);
      }

      return bookCopy;
    } catch (error) {
      console.error('Error fetching book copy details:', error);
      throw new HttpException(
        'Error fetching book copy details',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateBookCopyDetails(id: string, updatePayload: UpdateBookCopyDTO) {
    try {
      // Find the existing book copy
      const existingBookCopy = await this.bookcopyRepository.findOne({
        where: { bookCopyUUID: id, isArchived: false }, // Ensure it's not archived
      });

      if (!existingBookCopy) {
        throw new HttpException(
          'Book copy not found or archived',
          HttpStatus.NOT_FOUND,
        );
      }

      // Update the book copy
      await this.bookcopyRepository.update(id, updatePayload);

      // Return updated book copy
      return await this.bookcopyRepository.findOne({
        where: { bookCopyUUID: id },
      });
    } catch (error) {
      console.error('Error updating book copy:', error);
      throw new HttpException(
        'Error updating book copy',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
