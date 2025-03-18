import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookCopy, TBookCopy } from './entity/books_v2.copies.entity';
import { BookTitle, TBookTitle } from './entity/books_v2.title.entity';
import { TCreateBookZodDTO } from './zod/createbookdtozod';
import { insertQueryHelper } from 'src/misc/custom-query-helper';
import { UpdateBookTitleDTO } from './zod/updatebookdto';
import { TCreateBooklogDTO } from 'src/book_log/zod/createbooklog';
import { Students } from 'src/students/students.entity';
import { Booklog_v2, booklogV2, TBooklog_v2 } from './entity/book_logv2.entity';
import { genBookId } from './create-book-id';
import { TCreateBooklogV2DTO } from './zod/create-booklogv2-zod';
import { createObjectOmitProperties } from 'src/misc/create-object-from-class';
import type { Request } from "express";

@Injectable()
export class BooksV2Service {
  constructor(
    @InjectRepository(BookCopy)
    private readonly bookcopyRepository: Repository<BookCopy>,

    @InjectRepository(BookTitle)
    private readonly booktitleRepository: Repository<BookTitle>,

    @InjectRepository(Students)
    private readonly sudentRepository: Repository<Students>,

    @InjectRepository(Booklog_v2)
    private readonly booklogRepository: Repository<Booklog_v2>,
  ) {}

  async getBooks(
    { page, limit, search }: { page: number; limit: number; search: string } = {
      page: 1,
      limit: 10,
      search: '',
    },
  ) {
    try {
      console.log(page, limit, search);
      const offset = (page - 1) * limit;
      const searchQuery = search ? `${search}%` : '%';

      const books = await this.booktitleRepository.query
      (
        `SELECT * FROM book_titles WHERE book_title LIKE $1 AND is_archived = false LIMIT $2 OFFSET $3;`,
        [searchQuery, limit, offset]
      ); 
      const total = await this.booktitleRepository.query(
        `SELECT COUNT(*) as count FROM book_titles 
        WHERE is_archived = false AND book_title ILIKE $1`,
          [searchQuery],
      );

      return {
        data: books,
        pagination: {
          total: parseInt(total[0].count, 10),
          page,
          limit,
          totalPages: Math.ceil(parseInt(total[0].count, 10) / limit),
        },
      };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Error fetching books',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getBookTitleDetails({
    book_uuid,
    isbn,
    titlename,
  }: {
    book_uuid: string;
    isbn: string;
    titlename: string;
  }) {
    try {
      const queryParams: string[] = [];
      let query = `SELECT * FROM book_titles WHERE 1=1`;

      if (book_uuid) {
        query += ` AND book_uuid = $${queryParams.length + 1}`;
        queryParams.push(book_uuid);
      }
      if (isbn) {
        query += ` AND isbn = $${queryParams.length + 1}`;
        queryParams.push(isbn);
      }
      if (titlename) {
        query += ` AND book_title ILIKE $${queryParams.length + 1}`;
        queryParams.push(`%${titlename}%`);
      }

      const book = await this.booktitleRepository.query(query.concat(' LIMIT 1'), queryParams);

      if (book.length === 0) {
        throw new HttpException('Book not found', HttpStatus.NOT_FOUND);
      }

      return book; // Return only the first matching book
    } catch (error) {
      throw new HttpException(
        'Error fetching book details',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getBookCopies(
    { page, limit }: { page: number; limit: number } = {
      page: 1,
      limit: 10,
    },
  ) {
    try {
      const offset = (page - 1) * limit;

      const books = await this.bookcopyRepository.query(
        `SELECT * FROM book_copies 
        WHERE is_archived = false
        LIMIT $1 OFFSET $2`,
        [limit, offset],
      );

      const total = await this.bookcopyRepository.query(
        `SELECT COUNT(*) as count FROM book_copies 
        WHERE is_archived = false`,
      );

        return {
          data: books,
          pagination: {
            total: parseInt(total[0].count, 10),
            page,
            limit,
            totalPages: Math.ceil(parseInt(total[0].count, 10) / limit),
          },
        };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Error fetching books',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //----------
  async getBookCopiesByTitle({
    book_uuid,
    isbn,
    titlename,
  }: {
    book_uuid: string;
    isbn: string;
    titlename: string;
  }) {
    try {
      const queryParams: string[] = [];
      let query = `SELECT book_uuid, book_title FROM book_titles WHERE 1=1`;

      if (book_uuid) {
        query += ` AND book_uuid = $${queryParams.length + 1}`;
        queryParams.push(book_uuid);
      }
      if (isbn) {
        query += ` AND isbn = $${queryParams.length + 1}`;
        queryParams.push(isbn);
      }
      if (titlename) {
        query += ` AND book_title LIKE $${queryParams.length + 1}`;
        queryParams.push(`${titlename}%`);
      }

      const book = await this.booktitleRepository.query(query, queryParams);

      console.log({ book });
      console.log("THIS IS THE UUID", book[0]);

      if (book.length === 0) {
        throw new HttpException('Book not found', HttpStatus.NOT_FOUND);
      }


      const books = await this.bookcopyRepository.query(
        `SELECT * FROM book_copies 
        WHERE is_archived = false AND book_title_uuid = $1`,
          [book[0].book_uuid],
      );

      console.log({ books });

      return {
        title: book,
        copies: books,
      };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Error fetching books',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getSingleCopyInfo(identifier: string) {
    try {
      let query = `SELECT * FROM book_copies WHERE `;
      let params: (string | number)[] = [];

      if (!isNaN(Number(identifier))) {
        query += `(barcode = $1 OR inventory_number = $1) `;
        params.push(Number(identifier)); // Convert to BIGINT
      } else {
        query += `book_copy_uuid = $1 `;
        params.push(identifier);
      }

      query += `AND is_archived = false`;

      const book = await this.bookcopyRepository.query(query, params);

      return { message: 'Book fetched successfully', book: book[0] };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Error fetching copy',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getArchivedBooks(
    { page, limit, search }: { page: number; limit: number; search: string } = {
      page: 1,
      limit: 10,
      search: '',
    },
  ) {
    try {
      console.log(page, limit, search);
      const offset = (page - 1) * limit;
      const searchQuery = search ? '%${search}%' : '%';

      const books = await this.booktitleRepository.query(
        `SELECT * FROM book_titles 
        WHERE is_archived = true AND book_title ILIKE $1
        LIMIT $2 OFFSET $3`,
        [searchQuery, limit, offset],
      );

      const total = await this.booktitleRepository.query(
        `SELECT COUNT(*) as count FROM book_titles 
        WHERE is_archived = true AND book_title ILIKE $1`,
          [searchQuery],
      );

      return {
        data: books,
        pagination: {
          total: parseInt(total[0].count, 10),
          page,
          limit,
          totalPages: Math.ceil(parseInt(total[0].count, 10) / limit),
        },
      };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Error fetching books',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getArchivedBooksCopy(
    { page, limit }: { page: number; limit: number } = {
      page: 1,
      limit: 10,
    },
  ) {
    try {
      const offset = (page - 1) * limit;

      const books = await this.bookcopyRepository.query(
        `SELECT * FROM book_copies 
        WHERE is_archived = true
        LIMIT $1 OFFSET $2`,
        [limit, offset],
      );

      const total = await this.bookcopyRepository.query(
        `SELECT COUNT(*) as count FROM book_copies 
        WHERE is_archived = true`,
      );

        return {
          data: books,
          pagination: {
            total: parseInt(total[0].count, 10),
            page,
            limit,
            totalPages: Math.ceil(parseInt(total[0].count, 10) / limit),
          },
        };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Error fetching books',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getavailablebookbyisbn(isbn: string) {
    try {
      const bookTitle = await this.booktitleRepository.query(
        `
        SELECT * FROM book_titles
        WHERE isbn = $1
        LIMIT 1
        `,
        [isbn],
      );
      const result = await this.bookcopyRepository.query(
        `
        SELECT *
          FROM book_copies 
        WHERE book_title_uuid = $1 AND is_available = true AND is_archived = false`,
          [bookTitle[0].book_uuid],
      );
      return result;
    } catch (error) {
      console.error('Error getting book in library:', error);
      throw new HttpException(
        'Error getting book in library',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllAvailableBooks(
    { page, limit }: { page: number; limit: number } = {
      page: 1,
      limit: 10,
    },
  ) {
    try {
      const offset = (page - 1) * limit;

      const books = await this.bookcopyRepository.query(
        `SELECT * FROM book_copies 
        WHERE is_archived = false AND is_available = true
        LIMIT $1 OFFSET $2`,
        [limit, offset],
      );

      const total = await this.bookcopyRepository.query(
        `SELECT COUNT(*) as count FROM book_copies 
        WHERE is_archived = false AND is_available = true`,
      );

        return {
          data: books,
          pagination: {
            total: parseInt(total[0].count, 10),
            page,
            limit,
            totalPages: Math.ceil(parseInt(total[0].count, 10) / limit),
          },
        };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Error fetching books',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getunavailablebookbyisbn(isbn: string) {
    try {
      const bookTitle = await this.booktitleRepository.query(
        `
        SELECT * FROM book_titles
        WHERE isbn = $1
        LIMIT 1
        `,
        [isbn],
      );
      console.log({ bookTitle });
      const result = await this.bookcopyRepository.query(
        `
        SELECT *
          FROM book_copies 
        WHERE book_title_uuid = $1 AND is_available = false AND is_archived = false`,
          [bookTitle[0].book_uuid],
      );
      return result;
    } catch (error) {
      console.error('Error getting book in library:', error);
      throw new HttpException(
        'Error getting book in library',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllUnavailableBooks(
    { page, limit }: { page: number; limit: number } = {
      page: 1,
      limit: 10,
    },
  ) {
    try {
      const offset = (page - 1) * limit;

      const books = await this.bookcopyRepository.query(
        `SELECT * FROM book_copies 
        WHERE is_archived = false AND is_available = false
        LIMIT $1 OFFSET $2`,
        [limit, offset],
      );

      const total = await this.bookcopyRepository.query(
        `SELECT COUNT(*) as count FROM book_copies 
        WHERE is_archived = false AND is_available = false`,
      );

        return {
          data: books,
          pagination: {
            total: parseInt(total[0].count, 10),
            page,
            limit,
            totalPages: Math.ceil(parseInt(total[0].count, 10) / limit),
          },
        };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Error fetching books',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getLogDetails(
    { page, limit }: { page: number; limit: number } = {
      page: 1,
      limit: 10,
    },
  ) {
    try {
      const offset = (page - 1) * limit;

      const booksTitleLogs = await this.booklogRepository.query(
        `SELECT * from book_logv2 INNER JOIN book_titles ON book_titles.book_uuid = book_logv2.book_title_uuid LIMIT $1 OFFSET $2`,
        [limit, offset],
      );

      const booksCopiesLogs = await this.booklogRepository.query(
        `SELECT * FROM book_logv2 INNER JOIN book_copies ON book_copies.book_copy_uuid = book_logv2.book_copy_uuid;`
      );

      const studentLogs = await this.booklogRepository.query(
        `SELECT * FROM book_logv2 INNER JOIN students_table ON students_table.student_uuid = book_logv2.borrower_uuid;`
      );

      const total = await this.booklogRepository.query
      (
        `SELECT COUNT(*) as count FROM book_logv2`,
      );

      return {
        data: { booksTitleLogs, booksCopiesLogs, studentLogs },
        pagination: {
          total: parseInt(total[0].count, 10),
          page,
          limit,
          totalPages: Math.ceil(parseInt(total[0].count, 10) / limit),
        },
      };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Error fetching books',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getLogDetailsByTitle({
    book_uuid,
    isbn,
  }: {
    book_uuid: string;
    isbn: string;
  }) {
    try {
      const logs = await this.booklogRepository.query(
        `SELECT * FROM book_logv2 
        WHERE book_uuid = $1`,
          [book_uuid],
      );
      return {
        data: logs,
      };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Error fetching books',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getLogDetailsByCopy({ barcode }: { barcode: string }) {
    try {
      const book = await this.bookcopyRepository.query(
        `SELECT * FROM book_copies 
        WHERE barcode = $1`,
          [barcode],
      );

      const logs = await this.booklogRepository.query(
        `SELECT * FROM book_logv2 
        WHERE book_copy_uuid = $1`,
          [book[0].book_copy_uuid],
      );
      return {
        data: logs,
      };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Error fetching books',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // TODO: Edit Functionality PS. Not working properly
  async updateBookTitle(id: string, updateBookPayload: UpdateBookTitleDTO) {
    try {
      const book = await this.booktitleRepository.query(
        `SELECT * FROM book_titles WHERE book_uuid = $1 AND is_archived = false LIMIT 1 `,
          [id],
      );

      if (!book) {
        throw new HttpException('Book not found', HttpStatus.NOT_FOUND);
      }

      await this.booktitleRepository.query(
        `UPDATE book_titles 
        SET 
        book_title = COALESCE($2, book_title),
          book_author = COALESCE($3, book_author),
          name_of_publisher = COALESCE($4, name_of_publisher),
          place_of_publication = COALESCE($5, place_of_publication),
          year_of_publication = COALESCE($6, year_of_publication),
          edition = COALESCE($7, edition),
          isbn = COALESCE($8, isbn),
          subject = COALESCE($9, subject),
          department = COALESCE($10, department),
          total_count = COALESCE($11, total_count),
          available_count = COALESCE($12, available_count),
          images = COALESCE($13, images),
          additional_fields = COALESCE($14, additional_fields),
          description = COALESCE($15, description),
          updated_at = NOW()
        WHERE book_uuid = $1`,
          [
          id,
          updateBookPayload.bookTitle,
          updateBookPayload.bookAuthor,
          updateBookPayload.nameOfPublisher,
          updateBookPayload.placeOfPublication,
          updateBookPayload.yearOfPublication,
          updateBookPayload.edition,
          updateBookPayload.isbn,
          updateBookPayload.subject,
          updateBookPayload.department,
          updateBookPayload.totalCount,
          updateBookPayload.availableCount,
          updateBookPayload.images,
          updateBookPayload.additionalFields,
          updateBookPayload.description,
        ],
      );

      return { message: 'Book updated successfully' };
    } catch (error) {
      console.log(error);
      throw new HttpException('Error updating book', HttpStatus.BAD_REQUEST);
    }
  }

  // Create a new book
  async createBook(createBookpayload: TCreateBookZodDTO) {
    try {
      //Check if book exists in BookTitle Table
      let bookTitleUUID: [{ book_uuid: string }] = await this.booktitleRepository.query(
        `SELECT book_uuid FROM book_titles WHERE isbn = $1`,
          [createBookpayload.isbn],
      );

      //Book Title Table logic
      if (!bookTitleUUID.length) {
        //Create custom Book Id
        const max: [{ max: null | string }] = await this.booktitleRepository.query(`SELECT MAX(book_title_id) FROM book_titles`);
        const bookId = genBookId(max[0].max, 'BT');
        const bookTitlePayloadWithId = { ...createBookpayload, book_title_id: bookId };

        //Create the required Columns, Arg, and Values
        //Ignore the Columns that are used by Copy table
        const bookTitleQueryData = insertQueryHelper(bookTitlePayloadWithId, [
          'source_of_acquisition', 'date_of_acquisition', 'bill_no', 'language',
          'inventory_number', 'accession_number', 'barcode', 'item_type', 'institute_uuid',
          'created_by', 'remarks', 'copy_images', 'copy_description', 'copy_additional_fields'
        ]);

        //Convert some specific fields to string
        bookTitleQueryData.values.forEach((element, idx) => {
          if(Array.isArray(element) || typeof element === 'object') {
            bookTitleQueryData.values[idx] = JSON.stringify(element);
          }
        }); 
        bookTitleUUID = await this.booktitleRepository.query
        (
          `INSERT INTO book_titles (${bookTitleQueryData.queryCol}) VALUES (${bookTitleQueryData.queryArg}) RETURNING book_uuid`,
          bookTitleQueryData.values
        );
      } else {
        await this.booktitleRepository.query
        (
          `UPDATE book_titles SET total_count = total_count + 1, available_count = available_count + 1, updated_at = NOW() WHERE isbn = $1`,
            [createBookpayload.isbn],
        );
      }
      //Book Copy Table logic

      //Create custom Book Id
      const max: [{ max: null | string }] = await this.booktitleRepository.query(`SELECT MAX(book_copy_id) FROM book_copies`);
      const bookId = genBookId(max[0].max, 'BC');
      const bookCopyPayloadWithId = { ...createBookpayload, book_copy_id: bookId, book_title_uuid: bookTitleUUID[0].book_uuid };

      //Create the required Columns, Arg, and Values
      //Ignore the Columns that are used by Title table
      const bookCopyQueryData = insertQueryHelper(bookCopyPayloadWithId, [
        'book_title', 'book_author', 'name_of_publisher', 'place_of_publication',
        'year_of_publication', 'edition', 'isbn', 'no_of_pages', 'no_of_preliminary', 'subject',
        'department', 'call_number', 'author_mark', 'title_images', 'title_description', 'title_additional_fields'
      ]);

      //Convert some specific fields to string
      bookCopyQueryData.values.forEach((element, idx) => {
        if(Array.isArray(element) || typeof element === 'object') {
          bookCopyQueryData.values[idx] = JSON.stringify(element);
        }
      }); 

      await this.bookcopyRepository.query
      (
        `INSERT INTO book_copies (${bookCopyQueryData.queryCol}) VALUES (${bookCopyQueryData.queryArg})`,
        bookCopyQueryData.values
      );
      return { statusCode: HttpStatus.CREATED, message: "Book created" }
    } catch (error) {
      throw error;
    }
  }

  async updateTitleArchive(book_uuid: string) {
    try {
      // Check if the book exists and is not archived
      const book = await this.booktitleRepository.query(
        `SELECT * FROM book_titles WHERE book_uuid ='${book_uuid}' AND is_archived = false`,
      );
        console.log({ book });

        if (book.length === 0) {
          throw new HttpException(
            'Book not found or already archived',
            HttpStatus.NOT_FOUND,
          );
        }

        // Update is_archived to true
        await this.booktitleRepository.query(
          `UPDATE book_titles SET is_archived = true WHERE book_uuid = $1`,
            [book_uuid],
        );

        await this.bookcopyRepository.query(
          `UPDATE book_copies SET is_archived = true WHERE book_title_uuid = $1`,
            [book_uuid],
        );

        return { message: 'Book archived successfully' };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Error archiving book',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async restoreBook(book_uuid: string) {
    try {
      const book = await this.booktitleRepository.query(
        `SELECT * FROM book_titles WHERE book_uuid = $1 AND is_archived = true`,
          [book_uuid],
      );

      if (book.length === 0) {
        throw new HttpException(
          'Book not found or already active',
          HttpStatus.NOT_FOUND,
        );
      }

      await this.booktitleRepository.query(
        `UPDATE book_titles SET is_archived = false WHERE book_uuid = $1`,
          [book_uuid],
      );

      return { message: 'Book restored successfully' };
    } catch (error) {
      throw new HttpException(
        'Error restoring book',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateBookCopy(id: string, updateBookCopyPayload: any) {
    try {
      const bookCopy = await this.bookcopyRepository.query(
        `SELECT * FROM book_copies WHERE book_copy_uuid = $1 LIMIT 1`,
          [id],
      );

      console.log({ bookCopy });

      if (!bookCopy || bookCopy.length === 0) {
        throw new HttpException('Book copy not found', HttpStatus.NOT_FOUND);
      }

      await this.bookcopyRepository.query(
        `UPDATE book_copies 
        SET 
        source_of_acquisition = COALESCE($2, source_of_acquisition),
          date_of_acquisition = COALESCE($3, date_of_acquisition),
          bill_no = COALESCE($4, bill_no),
          language = COALESCE($5, language),
          inventory_number = COALESCE($6, inventory_number),
          accession_number = COALESCE($7, accession_number),
          barcode = COALESCE($8, barcode),
          item_type = COALESCE($9, item_type),
          remarks = COALESCE($10, remarks),
          copy_images = COALESCE($11, copy_images),
          copy_additional_fields = COALESCE($12, copy_additional_fields),
          copy_description = COALESCE($13, copy_description),
          updated_at = NOW()
        WHERE book_copy_uuid = $1`,
          [
          id,
          updateBookCopyPayload.source_of_acquisition,
          updateBookCopyPayload.date_of_acquisition,
          updateBookCopyPayload.bill_no,
          updateBookCopyPayload.language,
          updateBookCopyPayload.inventory_number,
          updateBookCopyPayload.accession_number,
          updateBookCopyPayload.barcode,
          updateBookCopyPayload.item_type,
          updateBookCopyPayload.remarks,
          updateBookCopyPayload.copy_images,
          updateBookCopyPayload.copy_additional_fields,
          updateBookCopyPayload.copy_description,
        ],
      );

      return { message: 'Book copy updated successfully' };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Error updating book copy',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async archiveBookCopy(book_copy_uuid: string) {
    try {
      // Archive the book copy and get the bookTitleUUID
      const archiveResult = await this.bookcopyRepository.query(
        `UPDATE book_copies 
        SET is_archived = true 
        WHERE book_copy_uuid = $1 
        RETURNING book_title_uuid`,
        [book_copy_uuid],
      );

      if (archiveResult.length === 0) {
        throw new Error('Book copy not found or already archived');
      }

      const bookTitleUUID = archiveResult[0][0].book_title_uuid;

      console.log({ bookTitleUUID });

      // Reduce total_count and available_count in book_titles
      await this.booktitleRepository.query(
        `UPDATE book_titles 
        SET 
        total_count = GREATEST(total_count - 1, 0), 
          available_count = GREATEST(available_count - 1, 0)
        WHERE book_uuid = $1`,
          [bookTitleUUID],
      );

      return { success: true, message: 'Book copy archived successfully' };
    } catch (error) {
      console.error('Error archiving book copy:', error);
      throw new Error('Failed to archive book copy');
    }
  }

  async restoreBookCopy(book_uuid: string) {
    try {
      const book = await this.bookcopyRepository.query(
        `SELECT * FROM book_copies WHERE book_copy_uuid = $1 AND is_archived = true`,
          [book_uuid],
      );

      if (book.length === 0) {
        throw new HttpException(
          'Book not found or already active',
          HttpStatus.NOT_FOUND,
        );
      }

      await this.booktitleRepository.query(
        `UPDATE book_copies SET is_archived = false WHERE book_copy_uuid = $1 RETURNING book_title_uuid`,
          [book_uuid],
      );

      const bookTitleUUID = book[0].book_title_uuid;

      await this.booktitleRepository.query(
        `UPDATE book_titles 
        SET 
        total_count = total_count + 1, 
          available_count = available_count + 1
        WHERE book_uuid = $1`,
          [bookTitleUUID],
      );

      return { message: 'Book restored successfully' };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Error restoring book',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async isbnBook(isbn: string) {
    const result = await this.booktitleRepository.query
    (`SELECT book_copies.source_of_acquisition, book_copies.date_of_acquisition, book_copies.bill_no,book_copies.language,book_copies.inventory_number, book_copies.accession_number,book_copies.barcode,book_copies.item_type,book_copies.remarks,book_titles.book_title,book_titles.book_author,book_titles.name_of_publisher,book_titles.place_of_publication,book_titles.year_of_publication,book_titles.edition,book_titles.subject,book_titles.department,book_titles.call_number,book_titles.author_mark,book_titles.images,book_titles.additional_fields,book_titles.description,book_titles.no_of_pages,book_titles.no_of_preliminary,book_titles.isbn FROM book_titles INNER JOIN book_copies on book_titles.book_uuid = book_copies.book_title_uuid where book_titles.isbn='${isbn}' LIMIT 1`);
    if (result.length === 0) {
      throw new Error('No data found');
    }
    return result;
  }

  async bookReturned(
    booklogPayload: Omit<TCreateBooklogV2DTO, 'action'>,
    request: Request,
    status: 'returned'
  ) {
    try {
      if(!request.ip) {
        throw new HttpException("Unable to get IP address of the Client", HttpStatus.INTERNAL_SERVER_ERROR);
      }
      const studentExists: { student_uuid: string }[] = await this.sudentRepository.query(
        `SELECT student_uuid FROM students_table WHERE student_id = $1`,
          [booklogPayload.student_id],
      );

      if (!studentExists.length) {
        throw new HttpException('Cannot find Student ID', HttpStatus.NOT_FOUND);
      } 

      //Check if Book exists in Book Copies as not available
      //Insert into old_book_copy COLUMN
      const bookPayloadFromBookCopies: TBookCopy[] = await this.bookcopyRepository.query
      (
        `SELECT * FROM book_copies WHERE book_copy_id = $1 AND barcode = $2 AND is_available = FALSE`,
        [booklogPayload.book_copy_id, booklogPayload.barcode]
      );

      if(!bookPayloadFromBookCopies.length) {
        throw new HttpException("Cannot find Borrowed Book", HttpStatus.NOT_FOUND);
      }

      const bookBorrowedPayload: TBooklog_v2[] = await this.booklogRepository.query(
        `SELECT * FROM book_logv2 WHERE borrower_uuid = $1 AND book_copy_uuid = $2 AND action = 'borrowed'`,
        [studentExists[0].student_uuid, bookPayloadFromBookCopies[0].book_copy_uuid]
      );

      //if student doesn't exist in Booklog table (it hasn't borrowed), or it isn't the book that it borrowed, but attempting to return it
      if(!bookBorrowedPayload.length) {
        throw new HttpException('Student hasn\'t borrowed at all, or Invalid Book is being returned', HttpStatus.NOT_FOUND);
      }

      //Check if Book hasn't reached its total count in Book Titles through book_title_uuid received from Book Copies via SELECT query
      //Insert into old_book_title COLUMN
      const bookPayloadFromBookTitle: TBookTitle[] = await this.bookcopyRepository.query
      (
        `SELECT * FROM book_titles WHERE book_uuid = $1 AND available_count != total_count`,
        [bookPayloadFromBookCopies[0].book_title_uuid]
      )

      if(!bookPayloadFromBookTitle.length) {
        throw new HttpException("Seems like Book is fully returned in Book Titles, but exists in Book Log as not returned", HttpStatus.INTERNAL_SERVER_ERROR);
      }

      //UPDATING now is safe
      //Insert into new_book_copy
      const updatedBookCopiesPayload: [TBookCopy[], 0 | 1] = await this.bookcopyRepository.query
      (
        `UPDATE book_copies SET is_available = TRUE WHERE book_copy_uuid = $1 AND barcode = $2 AND is_available = FALSE
        RETURNING *`,
        [bookPayloadFromBookCopies[0].book_copy_uuid, bookPayloadFromBookCopies[0].barcode],
      );

      const updateStatus = updatedBookCopiesPayload[1];
      if(!updateStatus) {
        //if somehow the update fails, even after getting the data through SELECT query 
        throw new HttpException("Failed to update Book", HttpStatus.INTERNAL_SERVER_ERROR);
      }

      if(!updatedBookCopiesPayload[0].length) {
        //if for some reason update array response is empty, then
        throw new HttpException("Something went wrong", HttpStatus.INTERNAL_SERVER_ERROR);
      }

      const bookTitleUUID = updatedBookCopiesPayload[0][0].book_title_uuid;
      const bookCopyUUID = updatedBookCopiesPayload[0][0].book_copy_uuid;

      //Insert into new_book_copy COLUMN
      const updatedBookTitlePayload: [TBookTitle[], 0 | 1] = await this.booktitleRepository.query
      (
        `UPDATE book_titles SET available_count = available_count + 1 WHERE book_uuid = $1 RETURNING *`,
        [bookTitleUUID]
      );

      const oldBookCopy = JSON.stringify(bookPayloadFromBookCopies[0]);
      const newBookCopy = JSON.stringify(updatedBookCopiesPayload[0][0]);

      const oldBookTitle = JSON.stringify(bookPayloadFromBookTitle[0]);
      const newBookTitle = JSON.stringify(updatedBookTitlePayload[0][0]);

      await this.booklogRepository.query
      (
        `INSERT INTO book_logv2 (
          borrower_uuid, book_copy_uuid, action, description, book_title_uuid,
          old_book_copy, new_book_copy, old_book_title, new_book_title, ip_address
        ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`, 
        [
          studentExists[0].student_uuid, bookCopyUUID, status, 'Book has been returned', bookTitleUUID,
          oldBookCopy, newBookCopy, oldBookTitle, newBookTitle, request.ip
        ]
      );

      return { statusCode: HttpStatus.CREATED, message: "Book returned successfully" };
    } catch (error) {
      throw error;
    }
  }

  async bookBorrowed(
    booklogPayload: Omit<TCreateBooklogV2DTO, 'action'>,
    request: Request,
    status: 'borrowed' | 'in_library_borrowed'
  ) {
    try {
      if(!request.ip) {
        throw new HttpException("Unable to get IP address of the Client", HttpStatus.INTERNAL_SERVER_ERROR);
      }
      const studentExists: { student_uuid: string }[] = await this.sudentRepository.query(
        `SELECT student_uuid FROM students_table WHERE student_id = $1`,
          [booklogPayload.student_id],
      );
      if (!studentExists.length) {
        throw new HttpException('Cannot find Student ID', HttpStatus.NOT_FOUND);
      }      

      //Check if Book exists in Book Copies
      //Insert into old_book_copy COLUMN
      const bookPayloadFromBookCopies: TBookCopy[] = await this.bookcopyRepository.query
      (
        `SELECT * FROM book_copies WHERE book_copy_id = $1 AND barcode = $2 AND is_available = TRUE`,
        [booklogPayload.book_copy_id, booklogPayload.barcode]
      );

      if(!bookPayloadFromBookCopies.length) {
        throw new HttpException("Cannot find Book", HttpStatus.NOT_FOUND);
      }

      
      //Check if Book exists in Book Titles through book_title_uuid received from Book Copies via SELECT query
      //Also make sure it's available
      //Insert into old_book_title COLUMN
      const bookPayloadFromBookTitle: TBookTitle[] = await this.bookcopyRepository.query
      (
        `SELECT * FROM book_titles WHERE book_uuid = $1 AND available_count > 0`,
        [bookPayloadFromBookCopies[0].book_title_uuid]
      )

      if(!bookPayloadFromBookTitle.length) {
        throw new HttpException("Book doesn't seems to be available in Book Titles, but exists in Book Copies", HttpStatus.INTERNAL_SERVER_ERROR);
      }

      //UPDATING now is safe
      //Insert into new_book_copy
      const updatedBookCopiesPayload: [TBookCopy[], 0 | 1] = await this.bookcopyRepository.query
      (
        `UPDATE book_copies SET is_available = FALSE WHERE book_copy_uuid = $1 AND barcode = $2 AND is_available = TRUE 
        RETURNING *`,
        [bookPayloadFromBookCopies[0].book_copy_uuid, bookPayloadFromBookCopies[0].barcode],
      );

      const updateStatus = updatedBookCopiesPayload[1];
      if(!updateStatus) {
        //if somehow the update fails, even after getting the data through SELECT query 
        throw new HttpException("Failed to update Book", HttpStatus.INTERNAL_SERVER_ERROR);
      }

      if(!updatedBookCopiesPayload[0].length) {
        //if for some reason update array response is empty, then
        throw new HttpException("Something went wrong", HttpStatus.INTERNAL_SERVER_ERROR);
      }

      const bookTitleUUID = updatedBookCopiesPayload[0][0].book_title_uuid;
      const bookCopyUUID = updatedBookCopiesPayload[0][0].book_copy_uuid;

      //Insert into new_book_copy COLUMN
      const updatedBookTitlePayload: [TBookTitle[], 0 | 1] = await this.booktitleRepository.query
      (
        `UPDATE book_titles SET available_count = available_count - 1 WHERE book_uuid = $1 RETURNING *`,
        [bookTitleUUID]
      );

      const oldBookCopy = JSON.stringify(bookPayloadFromBookCopies[0]);
      const newBookCopy = JSON.stringify(updatedBookCopiesPayload[0][0]);

      const oldBookTitle = JSON.stringify(bookPayloadFromBookTitle[0]);
      const newBookTitle = JSON.stringify(updatedBookTitlePayload[0][0]);

      await this.booklogRepository.query
      (
        `INSERT INTO book_logv2 (
          borrower_uuid, book_copy_uuid, action, description, book_title_uuid,
          old_book_copy, new_book_copy, old_book_title, new_book_title, ip_address
        ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`, 
        [
          studentExists[0].student_uuid, bookCopyUUID, status, 'Book has been borrowed', bookTitleUUID,
          oldBookCopy, newBookCopy, oldBookTitle, newBookTitle, request.ip
        ]
      );

      return { statusCode: HttpStatus.CREATED, message: 'Book borrowed successfully' };
    } catch (error) {
      throw error;
    }
  }

  async setbooklibrary(booklogpayload: TCreateBooklogV2DTO, ipAddress: string) {
    try {
      // Validate student existence
      const studentExists = await this.sudentRepository.query(
        `SELECT * FROM students_table WHERE student_uuid = $1`,
          [booklogpayload.student_id],
      );

      if (studentExists.length === 0) {
        console.error(' Invalid Student ID:', booklogpayload.student_id);
        throw new HttpException('Invalid Student UUID', HttpStatus.BAD_REQUEST);
      }

      const bookData = await this.bookcopyRepository.query(
        `SELECT * FROM book_copies WHERE (barcode=$1 AND is_available=true)`,
          [booklogpayload.barcode],
      );

      if (bookData.length === 0) {
        console.error(' Invalid Book UUID:', booklogpayload.book_copy_id);
        throw new HttpException('Invalid Barcode', HttpStatus.BAD_REQUEST);
      }

      const newData = await this.bookcopyRepository.query(
        `UPDATE book_copies SET is_available = FALSE WHERE book_copy_uuid = $1 RETURNING *`,
          [bookData[0].book_copy_uuid],
      );
      const newTitle = await this.booktitleRepository.query(
        `UPDATE book_titles SET available_count = available_count - 1 
        WHERE book_uuid = $1 RETURNING *`,
          [bookData[0].book_title_uuid],
      );

      //  Fetch Old Book Copy Data
      const oldBookCopy = bookData[0];
      const newBookCopyData = newData[0];
      const newBookTitleData = newTitle[0];

      const insertLogQuery = `
      INSERT INTO book_logv2 
      (person, borrower_id, new_booktitle, old_bookcopy, new_bookcopy, action, description, ip_address, time, book_uuid, book_copy_uuid) 
      VALUES 
      ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), $9, $10)
      `;

      console.log({ newBookTitleData, newBookCopyData });

      //const insertLogValues = [
      //  booklogpayload.borrower_id,
      //  booklogpayload.borrower_id,
      //  JSON.stringify(newBookTitleData),
      //  JSON.stringify(oldBookCopy),
      //  JSON.stringify(newBookCopyData),
      //  'read',
      //  'Book has been borrowed to be read in the library',
      //  ipAddress,
      //  newBookTitleData[0].book_uuid,
      //  newBookCopyData[0].book_copy_uuid,
      //];

      //await this.booktitleRepository.query(insertLogQuery, insertLogValues);
      return { message: 'Book borrowed successfully' };
    } catch (error) {
      console.error('Error setting book in library:', error);
      throw new HttpException(
        'Error setting book in library',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
