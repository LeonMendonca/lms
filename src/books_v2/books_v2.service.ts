import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookCopy } from './entity/books_v2.copies.entity';
import { BookTitle } from './entity/books_v2.title.entity';
// import { CreateBookTitleDTO } from './dto/createbookdto';
import { UpdateBookTitleDTO } from './dto/updatebookdto';
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
  async getBooks() {
    try {
      return await this.booktitleRepository.find({
        where: { isArchived: false },
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
        where: query as any, // Use the query as the condition for findOne
      });

      return book; // return the found book or null
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
}
