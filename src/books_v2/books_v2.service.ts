import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookCopy, TBookCopy } from './entity/books_v2.copies.entity';
import { BookTitle, TBookTitle } from './entity/books_v2.title.entity';
import { TCreateBookZodDTO } from './zod/createbookdtozod';
import { insertQueryHelper, selectQueryHelper } from 'src/misc/custom-query-helper';
import { TUpdatebookZodDTO } from './zod/updatebookdto';
import { TCreateBooklogDTO } from 'src/book_log/zod/createbooklog';
import { student, Students, TStudents } from 'src/students/students.entity';
import { Booklog_v2, booklogV2, TBooklog_v2 } from './entity/book_logv2.entity';
import { genBookId } from './create-book-id';
import { TupdatearchiveZodDTO } from './zod/uarchive';
import { TRestoreZodDTO } from './zod/restorearchive';
import { TCopyarchiveZodDTO } from './zod/archivebookcopy';
import { CreateBookCopyDTO } from './zod/createcopydto';
import { TRestorecopybookZodDTO } from './zod/restorebookcopies';
import { TUpdatebookcopyZodDTO } from './zod/updatebookcopy';
import { TCreateBooklogV2DTO } from './zod/create-booklogv2-zod';
import { createObjectOmitProperties } from 'src/misc/create-object-from-class';
import type { Request } from "express";
import { TUpdateInstituteZodDTO } from './zod/updateinstituteid';
import { FeesPenalties, TFeesPenalties } from 'src/fees-penalties/fees-penalties.entity';
import { CalculateDaysFromDate } from 'src/misc/calculate-diff-bw-date';
import { createNewDate } from 'src/misc/create-new-date';
import { TUpdateFeesPenaltiesZod } from './zod/update-fp-zod';

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

    @InjectRepository(FeesPenalties)
    private readonly fpRepository: Repository<FeesPenalties>,
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
console.log(query,queryParams)
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
      throw new HttpException(
        error.message,
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
      const searchQuery = search ? `%${search}%` : '%';

      const books = await this.booktitleRepository.query(
        `SELECT * FROM book_titles 
        WHERE is_archived = true AND book_title ILIKE $1
        LIMIT $2 OFFSET $3`,
        [searchQuery, limit, offset],
      );
      console.log(books);

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
        error.message,
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
      throw new HttpException(
        error.message,
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
        error.message,
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
      throw new HttpException(
        error.message,
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
      console.log(result);
      return result;
    } catch (error) {
      throw new HttpException(
        error.message,
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
      throw new HttpException(
        error.message,
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

      // const booksTitleLogs = await this.booklogRepository.query(
      //   `SELECT * from book_logv2 INNER JOIN book_titles ON book_titles.book_uuid = book_logv2.book_title_uuid LIMIT $1 OFFSET $2`,
      //   [limit, offset],
      // );

      // const booksCopiesLogs = await this.booklogRepository.query(
      //   `SELECT * FROM book_logv2 INNER JOIN book_copies ON book_copies.book_copy_uuid = book_logv2.book_copy_uuid LIMIT $1 OFFSET $2;`,
      //   [limit, offset]
      // );

      const studentLogs = await this.booklogRepository.query(
        `SELECT * FROM book_logv2 INNER JOIN students_table ON students_table.student_uuid = book_logv2.borrower_uuid LIMIT $1 OFFSET $2;`,
        [limit, offset]
      );

      const total = await this.booklogRepository.query
      (
        `SELECT COUNT(*) as count FROM book_logv2`,
      );

      return {
        // data: { booksTitleLogs, booksCopiesLogs, studentLogs },
        data: studentLogs,
        pagination: {
          total: parseInt(total[0].count, 10),
          page,
          limit,
          totalPages: Math.ceil(parseInt(total[0].count, 10) / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async getLogDetailsByTitle({
    book_title_id,
    isbn,
  }: {
    book_title_id: string;
    isbn: string;
  }) {
    try {
      let query = `SELECT book_copy_uuid, action, time, book_uuid, book_title, book_author, isbn, department, author_mark, available_count, total_count
      FROM book_logv2 INNER JOIN book_titles ON book_titles.book_uuid = book_logv2.book_title_uuid`
      const queryValue: string[] = [];

      if(book_title_id) {
        query = query.concat(` AND book_titles.book_title_id = $${queryValue.length + 1}`)
        queryValue.push(book_title_id);
      }
      if(isbn) {
        query = query.concat(` AND book_titles.isbn = $${queryValue.length + 1}`)
        queryValue.push(isbn)
      }
      const logs = await this.booklogRepository.query(query, queryValue);
      return {
        data: logs,
      };
    } catch (error) {
      throw error;
    }
  }

  async getLogDetailsByCopy({ barcode }: { barcode: string }) {
    try {
      const book = await this.bookcopyRepository.query(
        `SELECT * FROM book_copies 
        WHERE barcode = $1`,
          [barcode],
      );

      console.log("Book", book[0]);

      const logs = await this.booklogRepository.query(
        `SELECT * FROM book_logv2 
        WHERE book_copy_uuid = $1`,
          [book[0].book_copy_uuid],
      );
      return {
        data: logs,
      };
    } catch (error) {
      throw error;
    }
  }

  async getLogDetailsOfStudent(studentId: string) {
    try {
      const result: any[] = await this.booklogRepository.query
      (
        `SELECT book_copy_uuid, action, time, ip_address, email, institute_id, department, student_uuid, date_of_birth, gender, institute_name 
        FROM book_logv2 INNER JOIN students_table ON students_table.student_uuid = book_logv2.borrower_uuid 
        AND students_table.student_id = $1`,
        [studentId]
      );
      return {
        data: result 
      }
    } catch (error) {
      throw error;
    }
  }

  // TODO: Edit Functionality PS. Not working properly
  async updateBookTitle(id: string, updateBookPayload: TUpdatebookZodDTO) {
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
        title_description = COALESCE($3, title_description),
        author_mark = COALESCE($4, author_mark),
        book_author = COALESCE($5, book_author),
        isbn = COALESCE($6, isbn),
        call_number = COALESCE($7, call_number),
        department = COALESCE($8, department),
        edition = COALESCE($9, edition),
        name_of_publisher = COALESCE($10, name_of_publisher),
        no_of_pages = COALESCE($11, no_of_pages),
        no_of_preliminary = COALESCE($12, no_of_preliminary),
        place_of_publication = COALESCE($13, place_of_publication),
        subject = COALESCE($14, subject),
        title_additional_fields = COALESCE($15, title_additional_fields),
        title_images = COALESCE($16, title_images),
        year_of_publication = COALESCE($17, year_of_publication)
    WHERE book_uuid = $1;`,
          [
            id,
            updateBookPayload.book_title,
            updateBookPayload.title_description,
            updateBookPayload.author_mark,
            updateBookPayload.book_author,
            updateBookPayload.isbn,
            updateBookPayload.call_number,
            updateBookPayload.department,
            updateBookPayload.edition,
            updateBookPayload.name_of_publisher,
            updateBookPayload.no_of_pages,
            updateBookPayload.no_of_preliminary,
            updateBookPayload.place_of_publication,
            updateBookPayload.subject,
            updateBookPayload.title_additional_fields,
            updateBookPayload.title_images,
            updateBookPayload.year_of_publication
        ],
      );

      return { message: 'Book updated successfully' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
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

  async updateTitleArchive(creatbookpayload:TupdatearchiveZodDTO) {
    try {
      console.log(creatbookpayload.book_uuid);
      // Check if the book exists and is not archived
      const book = await this.booktitleRepository.query(
        `SELECT * FROM book_titles WHERE book_uuid =$1 AND is_archived = false`,[creatbookpayload.book_uuid]
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
            [creatbookpayload.book_uuid],
        );

        await this.bookcopyRepository.query(
          `UPDATE book_copies SET is_archived = true WHERE book_title_uuid = $1`,
            [creatbookpayload.book_uuid],
        );

        return { message: 'Book archived successfully' };
    } catch (error) {
      throw new HttpException(
        error.message,
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

  async updateBookCopy(id: string, updateBookCopyPayload: TUpdatebookcopyZodDTO) {
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
          [book_copy_uuid],
      );

      return { success: true, message: 'Book copy archived successfully' };
    } catch (error) {
     console.log(error);
      throw new HttpException(
        error.message,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async restoreBookCopy(book_copy_uuid: string) {
    try {
      const book = await this.bookcopyRepository.query(
        `SELECT * FROM book_copies WHERE book_copy_uuid = $1 AND is_archived = true`,
          [book_copy_uuid],
      );

      if (book.length === 0) {
        throw new HttpException(
          'Book not found or already active',
          HttpStatus.NOT_FOUND,
        );
      }

      await this.booktitleRepository.query(
        `UPDATE book_copies SET is_archived = false WHERE book_copy_uuid = $1 RETURNING book_title_uuid`,
          [book_copy_uuid],
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
    const result = await this.booktitleRepository.query(`
      SELECT book_copies.source_of_acquisition, book_copies.date_of_acquisition, book_copies.bill_no,book_copies.
      language,book_copies.inventory_number, book_copies.accession_number,book_copies.barcode,book_copies.item_type,book_copies.remarks,
      book_titles.book_title,book_titles.book_author,book_titles.name_of_publisher,book_titles.place_of_publication,book_titles.year_of_publication,
      book_titles.edition,book_titles.subject,book_titles.department,book_titles.call_number,book_titles.author_mark,book_titles.title_images,
      book_titles.title_additional_fields,book_titles.title_description,book_titles.no_of_pages,book_titles.no_of_preliminary,
      book_titles.isbn FROM book_titles INNER JOIN book_copies on book_titles.book_uuid = book_copies.book_title_uuid where book_titles.isbn='${isbn}' LIMIT 1
   `);
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
        `SELECT student_uuid FROM students_table WHERE student_id = $1 AND is_archived = FALSE`,
          [booklogPayload.student_id],
      );

      if (!studentExists.length) {
        throw new HttpException('Cannot find Student ID', HttpStatus.NOT_FOUND);
      } 

      //Check if Book exists in Book Copies as not available
      //Insert into old_book_copy COLUMN
      const bookPayloadFromBookCopies: TBookCopy[] = await this.bookcopyRepository.query
      (
        `SELECT * FROM book_copies WHERE book_copy_id = $1 AND barcode = $2 AND is_available = FALSE AND is_archived = FALSE`,
        [booklogPayload.book_copy_id, booklogPayload.barcode]
      );

      if(!bookPayloadFromBookCopies.length) {
        throw new HttpException("Cannot find Borrowed Book", HttpStatus.NOT_FOUND);
      }

      const bookBorrowedPayload: TBooklog_v2[] = await this.booklogRepository.query(
        `SELECT * FROM book_logv2 WHERE borrower_uuid = $1 AND book_copy_uuid = $2 
        AND (action = 'borrowed' OR action = 'in_library_borrowed')`,
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
        `SELECT * FROM book_titles WHERE book_uuid = $1 AND available_count != total_count AND is_archived = FALSE`,
        [bookPayloadFromBookCopies[0].book_title_uuid]
      )

      if(!bookPayloadFromBookTitle.length) {
        throw new HttpException("Seems like Book is fully returned in Book Titles, but exists in Book Log as not returned", HttpStatus.INTERNAL_SERVER_ERROR);
      }

      //UPDATING now is safe
      //Insert into new_book_copy
      const updatedBookCopiesPayload: [TBookCopy[], 0 | 1] = await this.bookcopyRepository.query
      (
        `UPDATE book_copies SET is_available = TRUE WHERE book_copy_uuid = $1 AND barcode = $2 
        AND is_available = FALSE AND is_archived = FALSE RETURNING *`,
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
        `UPDATE book_titles SET available_count = available_count + 1 WHERE book_uuid = $1 AND is_archived = FALSE RETURNING *`,
        [bookTitleUUID]
      );

      const oldBookCopy = JSON.stringify(bookPayloadFromBookCopies[0]);
      const newBookCopy = JSON.stringify(updatedBookCopiesPayload[0][0]);

      const oldBookTitle = JSON.stringify(bookPayloadFromBookTitle[0]);
      const newBookTitle = JSON.stringify(updatedBookTitlePayload[0][0]);

      const feesPenaltiesPayload: TFeesPenalties[] = await this.fpRepository.query(
        `SELECT * FROM fees_penalties WHERE borrower_uuid = $1 AND book_copy_uuid = $2 AND is_completed = FALSE`,
        [studentExists[0].student_uuid, bookBorrowedPayload[0].book_copy_uuid]
      );

      if(!feesPenaltiesPayload.length) {
        throw new HttpException('Cannot find Fees and Penalties record', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      //Get the date of book being returned
      const returnedAt: Date = new Date();
      //Get return date from database (when the book has to be returned)
      const returnDate: Date = new Date(feesPenaltiesPayload[0].return_date);

      let delayedDays = CalculateDaysFromDate(returnedAt, returnDate);
      let isPenalised = true;
      let isCompleted = false;

      if(delayedDays <= 0) {
        //re intialize it to 0, since no delay
        delayedDays = 0;
        //No delay, no penalty, and return process Completed
        isPenalised = false;
        isCompleted = true;
      }

      //Assuming penalty amount per day is 50
      let penaltyAmount = delayedDays * 50;

      console.log(delayedDays, returnDate, returnedAt, isPenalised, penaltyAmount);
      const fpUUID: [{ fp_uuid: string }[], 0 | 1] = await this.fpRepository.query
      (
        `UPDATE fees_penalties SET days_delayed = $1, penalty_amount = $2, is_penalised = $3, 
        returned_at = $4, is_completed = $5, updated_at = NOW()
        WHERE borrower_uuid = $6 AND book_copy_uuid = $7 AND is_completed = FALSE RETURNING fp_uuid`,
        [
          delayedDays, penaltyAmount, isPenalised, returnedAt, isCompleted, 
          bookBorrowedPayload[0].borrower_uuid, bookBorrowedPayload[0].book_copy_uuid
        ]
      );

      const updateStatusFP = fpUUID[1];
      //if update fails
      if(!updateStatusFP) {
        throw new HttpException('Failed to update fees_penalties table', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      await this.booklogRepository.query
      (
        `INSERT INTO book_logv2 (
          borrower_uuid, book_copy_uuid, action, description, book_title_uuid,
          old_book_copy, new_book_copy, old_book_title, new_book_title, ip_address, fp_uuid
        ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`, 
        [
          studentExists[0].student_uuid, bookCopyUUID, status, 'Book has been returned', bookTitleUUID,
          oldBookCopy, newBookCopy, oldBookTitle, newBookTitle, request.ip, fpUUID[0][0].fp_uuid
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
        `SELECT student_uuid FROM students_table WHERE student_id = $1 AND is_archived = FALSE`,
          [booklogPayload.student_id],
      );
      if (!studentExists.length) {
        throw new HttpException('Cannot find Student ID', HttpStatus.NOT_FOUND);
      }      

      //Check if Book exists in Book Copies
      //Insert into old_book_copy COLUMN
      const bookPayloadFromBookCopies: TBookCopy[] = await this.bookcopyRepository.query
      (
        `SELECT * FROM book_copies WHERE book_copy_id = $1 AND barcode = $2 AND is_available = TRUE AND is_archived = FALSE`,
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
        `SELECT * FROM book_titles WHERE book_uuid = $1 AND available_count > 0 AND is_archived = FALSE`,
        [bookPayloadFromBookCopies[0].book_title_uuid]
      )

      if(!bookPayloadFromBookTitle.length) {
        throw new HttpException("Book doesn't seems to be available in Book Titles, but exists in Book Copies", HttpStatus.INTERNAL_SERVER_ERROR);
      }

      //assuming that borower is trying to borrow penalised book
      const feesPenaltiesPayload: TFeesPenalties[] = await this.fpRepository.query(
        `SELECT * FROM fees_penalties WHERE borrower_uuid = $1 AND book_copy_uuid = $2 AND is_completed = FALSE AND is_penalised = TRUE`,
        [studentExists[0].student_uuid, bookPayloadFromBookCopies[0].book_copy_uuid]
      );

      if(feesPenaltiesPayload.length) {
        throw new HttpException('Cannot borrow this book, complete the penalty first', HttpStatus.BAD_REQUEST);
      }

      //UPDATING now is safe
      //Insert into new_book_copy
      const updatedBookCopiesPayload: [TBookCopy[], 0 | 1] = await this.bookcopyRepository.query
      (
        `UPDATE book_copies SET is_available = FALSE WHERE book_copy_uuid = $1 AND barcode = $2 AND is_available = TRUE AND is_archived = FALSE
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
        `UPDATE book_titles SET available_count = available_count - 1 WHERE book_uuid = $1 AND is_archived = FALSE RETURNING *`,
        [bookTitleUUID]
      );

      const oldBookCopy = JSON.stringify(bookPayloadFromBookCopies[0]);
      const newBookCopy = JSON.stringify(updatedBookCopiesPayload[0][0]);

      const oldBookTitle = JSON.stringify(bookPayloadFromBookTitle[0]);
      const newBookTitle = JSON.stringify(updatedBookTitlePayload[0][0]);

      

      let returnDays = 0;
      //if borrowed in library then return day 0, else incremented date
      if(status === 'in_library_borrowed')  {
        returnDays = 0;
      } else {
        returnDays = 7;
      }
      const createReturnDate = createNewDate(returnDays);

      const fpUUID: { fp_uuid: string }[] = await this.fpRepository.query
      (
        `INSERT INTO fees_penalties (payment_method, borrower_uuid, book_copy_uuid, return_date) values ($1, $2, $3, $4) RETURNING fp_uuid`,
        ['offline', studentExists[0].student_uuid, bookCopyUUID, createReturnDate]
      )

      await this.booklogRepository.query
      (
        `INSERT INTO book_logv2 (
          borrower_uuid, book_copy_uuid, action, description, book_title_uuid,
          old_book_copy, new_book_copy, old_book_title, new_book_title, ip_address, fp_uuid
        ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`, 
        [
          studentExists[0].student_uuid, bookCopyUUID, status, 'Book has been borrowed', bookTitleUUID,
          oldBookCopy, newBookCopy, oldBookTitle, newBookTitle, request.ip, fpUUID[0].fp_uuid
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
        `SELECT * FROM students_table WHERE student_uuid = $1 AND is_archived = FALSE`,
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

  async updateinstituteid(createinstitutepayload: TUpdateInstituteZodDTO) {
    try {
      console.log("working");
  
      const result = await this.bookcopyRepository.query(
        `SELECT * FROM book_copies WHERE book_copy_uuid=$1`, 
        [createinstitutepayload.book_copy_uuid]
      );
  
      console.log("working1");
  
      if (result.length === 0) {
        throw new HttpException('book_copy_uuid does not exist', HttpStatus.NOT_FOUND);
      }
  
      await this.bookcopyRepository.query(
        `UPDATE book_copies SET institute_uuid=$1 WHERE book_copy_uuid=$2`,
        [createinstitutepayload.institute_uuid, createinstitutepayload.book_copy_uuid]
      );
  
      return { message: 'Institute ID updated successfully', statusCode: HttpStatus.OK };
    } catch (error) {
      console.error(error);
      throw new HttpException(error.message || 'Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  // visit log



  

//   async visitlogexit(student_uuid: string) {
//     try {
//      const data=await this.booktitleRepository.query(`SELECT * FROM STUDENTS_TABLE WHERE STUDENT_UUID=$1`,[student_uuid])
//      if (data.length === 0) {
//       throw new HttpException(
//         { message: "Invalid student ID" },
//         HttpStatus.BAD_REQUEST
//       );
//     }
//     const validation=await this.booktitleRepository.query(
//       `SELECT * FROM visit_log WHERE student_uuid=$1 AND action='entry' ORDER BY timestamp DESC LIMIT 1`,
//       [student_uuid]    )
//     // console.log(`validation${validation}`);
//     // console.log("Validation result:", JSON.stringify(validation, null, 2));
//  if(validation===0) console.log('invalid');
//     await this.booktitleRepository.query(
//         `INSERT INTO visit_log (student_uuid, action) VALUES ($1, 'exit')`,
//         [student_uuid]
//       );
//       return {
//         message: "Visit log entry created successfully",
//         student_uuid: student_uuid,
//         timestamp: new Date().toISOString(), // Adding timestamp for clarity
//       };
//     } catch (error) {
//       throw new HttpException(
//         `Error ${error} setting book in library`,
//         HttpStatus.INTERNAL_SERVER_ERROR,);
//     }
//   } 

  async getStudentFee(student_id: string,isPenalty:boolean,is_completed:boolean) {
  try {
    if(student_id){
      const result:{student_uuid:string}[]=await this.booktitleRepository.query(`SELECT student_uuid FROM students_table WHERE student_id=$1`,[student_id])
      if(result.length===0){
        throw new HttpException({message:"Invaid Student ID !!"},HttpStatus.ACCEPTED)  
      }
      const data= await this.booktitleRepository.query(`SELECT penalty_amount FROM fees_penalties WHERE borrower_uuid=$1 and penalty_amount>0`,[result[0].student_uuid]) 
      if(data.length===0){
        throw new HttpException({message:"No Penalties are There!!"},HttpStatus.ACCEPTED)  
      }
      return data
    }
    //00008-Tech University-2025
    else if(isPenalty){
      const data=await this.bookcopyRepository.query(`SELECT * FROM fees_penalties WHERE is_penalised=$1`,[isPenalty])
      if(data.length===0){
        throw new HttpException({message:"No Penalties are Found!!"},HttpStatus.ACCEPTED)  
      }
      return data
    }
    else if(is_completed){
      const data=await this.bookcopyRepository.query(`SELECT * FROM fees_penalties WHERE is_completed=$1`,[is_completed])
      if(data.length===0){
        throw new HttpException({message:"No data are Found!!"},HttpStatus.ACCEPTED)  
      }
      return data
    }
  } catch (error) {
    throw error
  }
  }
  async getFullFeeList() {
try {
  const result= await this.booktitleRepository.query(`SELECT * FROM  fees_penalties`);
  if(result.length===0){
    throw new HttpException({message:"No data found!!"},HttpStatus.ACCEPTED)
  }
  return result
} catch (error) {
  throw error
}
  }
  async generateFeeReport(start: Date, end: Date) {
    try {
      const result = await this.booktitleRepository.query(
        `SELECT * FROM fees_penalties WHERE updated_at BETWEEN $1 AND $2;`, 
        [start, end]
    );
      //  console.log(result);
      if(result.length===0){
        throw new HttpException({message:"No data found!!"},HttpStatus.ACCEPTED)
      }
      
    } catch (error) {
    throw error
    }
  }

  async payStudentFee(updateFeesPayload: TUpdateFeesPenaltiesZod) {
    try {
      const studentAndBookCopiesPayloadWithFeesPenalties :
      {
        student_uuid: string;
        book_copy_uuid: string;
        penalty_amount: number;
        return_date: Date;
        returned_at: Date;
        paid_amount: number;
        is_penalised: boolean;
        is_completed: boolean;
      }[] = await this.sudentRepository.query
      (`
        SELECT student_uuid, book_copies.book_copy_uuid, penalty_amount, return_date, returned_at, paid_amount, is_penalised, is_completed 
        FROM fees_penalties 
        INNER JOIN students_table ON fees_penalties.borrower_uuid = students_table.student_uuid 
        INNER JOIN book_copies ON fees_penalties.book_copy_uuid = book_copies.book_copy_uuid 
        WHERE students_table.is_archived = FALSE
        AND students_table.student_id = $1 
        AND book_copies.is_archived = FALSE
        AND book_copies.book_copy_id = $2 
        AND penalty_amount > paid_amount
        AND is_completed = FALSE
        AND is_penalised = TRUE
        AND returned_at IS NOT NULL`,
        [updateFeesPayload.student_id, updateFeesPayload.book_copy_id],
      );

      if (!studentAndBookCopiesPayloadWithFeesPenalties.length) {
        throw new HttpException('Cannot find Student or Book, maybe archived or No penalty or Not returned', HttpStatus.BAD_REQUEST);
      }

      //Values when penalty
      let isPenalised = studentAndBookCopiesPayloadWithFeesPenalties[0].is_penalised; //True
      let isCompleted = studentAndBookCopiesPayloadWithFeesPenalties[0].is_completed; //False

      //current paid amount + new paid amount
      let accumulatedPaidAmount = (updateFeesPayload.paid_amount + studentAndBookCopiesPayloadWithFeesPenalties[0].paid_amount);

      //if student pays less than penalty amount then subtraction results gt 0;
      if((studentAndBookCopiesPayloadWithFeesPenalties[0].penalty_amount - accumulatedPaidAmount) <= 0) {
        isPenalised = !isPenalised;
        isCompleted = !isCompleted;
      }

      await this.fpRepository.query
      (`
        UPDATE fees_penalties SET payment_method = $1, paid_amount = $2, is_penalised = $3, is_completed = $4`,
        [updateFeesPayload.payment_method, accumulatedPaidAmount, isPenalised, isCompleted]
      );

      return { statusCode: HttpStatus.OK, messsage: 'Penalty paid successfully!' };
      
    } catch (error) {
      throw error;
    }    
  }

}
