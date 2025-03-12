import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookCopy } from './entity/books_v2.copies.entity';
import { BookTitle } from './entity/books_v2.title.entity';
import { Request } from 'express';
import { CreateBookCopyDTO } from './zod/createcopydto';
import { TCreateBookZodDTO } from './zod/createbookdtozod';
import { insertQueryHelper } from 'src/misc/custom-query-helper';
import { TisbnBookZodDTO } from './zod/isbnbookzod';
import { TupdatearchiveZodDTO } from './zod/uarchive';
import { UpdateBookTitleDTO } from './zod/updatebookdto';
import { TCreateBookDTO } from 'src/books/zod-validation/createbooks-zod';
import { count } from 'console';
import { string } from 'zod';
import { TCreateBooklogDTO } from 'src/book_log/zod/createbooklog';
import { Students } from 'src/students/students.entity';
import { Booklog_v2 } from './entity/book_logv2.entity';

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
      const searchQuery = search ? '%${search}%' : '%';

      const books = await this.booktitleRepository.query(
        `SELECT * FROM book_titles 
         WHERE is_archived = false AND book_title ILIKE $1
         LIMIT $2 OFFSET $3`,
        [searchQuery, limit, offset],
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

      const book = await this.booktitleRepository.query(query, queryParams);

      if (book.length === 0) {
        throw new HttpException('Book not found', HttpStatus.NOT_FOUND);
      }

      return book[0]; // Return only the first matching book
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

      const book = await this.booktitleRepository.query(query, queryParams);

      if (book.length === 0) {
        throw new HttpException('Book not found', HttpStatus.NOT_FOUND);
      }

      console.log({ book });

      const books = await this.bookcopyRepository.query(
        `SELECT * FROM book_copies 
         WHERE is_archived = false AND book_title_uuid = $1`,
        [book[0].book_uuid],
      );

      console.log({ books });

      return {
        data: books,
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
      console.log({bookTitle})
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

      const books = await this.booklogRepository.query(
        `SELECT * FROM book_logv2 
         LIMIT $1 OFFSET $2`,
        [limit, offset],
      );

      const total = await this.booklogRepository.query(
        `SELECT COUNT(*) as count FROM book_logv2`,
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
      let bookTitleExists = await this.booktitleRepository.query(
        `SELECT * FROM book_titles WHERE isbn = $1`,
        [createBookpayload.isbn],
      );

      if (!bookTitleExists.length) {
        bookTitleExists = await this.booktitleRepository.query(
          `
        INSERT INTO book_titles (
          book_title, book_author, name_of_publisher, place_of_publication,
          year_of_publication, edition, isbn, no_of_pages, no_of_preliminary,
          subject, department, call_number, author_mark,
          images, additional_fields, description,
          created_at, updated_at, total_count, available_count
        ) VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15,
          $16, NOW(), NOW(), 1, 1
        ) RETURNING *;
     `,
          [
            createBookpayload.book_title,
            createBookpayload.book_author,
            createBookpayload.name_of_publisher,
            createBookpayload.place_of_publication,
            createBookpayload.year_of_publication,
            createBookpayload.edition,
            createBookpayload.isbn,
            createBookpayload.no_of_pages,
            createBookpayload.no_of_preliminary,
            createBookpayload.subject,
            createBookpayload.department,
            createBookpayload.call_number,
            createBookpayload.author_mark,
            JSON.stringify(createBookpayload.images),
            JSON.stringify(createBookpayload.additional_fields),
            createBookpayload.description,
          ],
        );
      } else {
        await this.booktitleRepository.query(
          `UPDATE book_titles SET total_count = total_count + 1, available_count = available_count + 1, updated_at = NOW() WHERE isbn = $1`,
          [createBookpayload.isbn],
        );
      }

      await this.bookcopyRepository.query(
        `
      INSERT INTO book_copies (
        source_of_acquisition, date_of_acquisition, bill_no, language, 
        inventory_number, accession_number, barcode, item_type, institute_id, 
        is_archived, created_at, updated_at, created_by, book_title_uuid
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10,
        NOW(), NOW(), $11, $12
      ) RETURNING *;
      `,
        [
          createBookpayload.source_of_acquisition,
          createBookpayload.date_of_acquisition,
          createBookpayload.bill_no,
          createBookpayload.language,
          createBookpayload.inventory_number,
          createBookpayload.accession_number,
          createBookpayload.barcode,
          createBookpayload.item_type,
          createBookpayload.institute_id,
          false,
          createBookpayload.created_by,
          bookTitleExists[0].book_uuid,
        ],
      );
      return { message: 'Book Added successfully' };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Error adding book',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
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
    const result = await this.booktitleRepository.query(`
      SELECT book_copies.source_of_acquisition, book_copies.date_of_acquisition, book_copies.bill_no,book_copies.language,book_copies.inventory_number, book_copies.accession_number,book_copies.barcode,book_copies.item_type,book_copies.remarks,book_titles.book_title,book_titles.book_author,book_titles.name_of_publisher,book_titles.place_of_publication,book_titles.year_of_publication,book_titles.edition,book_titles.subject,book_titles.department,book_titles.call_number,book_titles.author_mark,book_titles.images,book_titles.additional_fields,book_titles.description,book_titles.no_of_pages,book_titles.no_of_preliminary,book_titles.isbn FROM book_titles INNER JOIN book_copies on book_titles.book_uuid = book_copies.book_title_uuid where book_titles.isbn='${isbn}' LIMIT 1
      `);
    if (result.length === 0) {
      throw new Error('No data found');
    }
    return result;
  }

  async createbookreturned(
    booklogpayload: {
      student_uuid: string;
      book_uuid: string | undefined;
      barcode: string;
    },
    ipAddress: string,
  ) {
    try {
      const studentExists = await this.sudentRepository.query(
        `SELECT * FROM students_table WHERE student_uuid = $1`,
        [booklogpayload.student_uuid],
      );

      if (studentExists.length === 0) {
        console.error(' Invalid Student UUID:', booklogpayload.student_uuid);
        throw new HttpException('Invalid Student UUID', HttpStatus.BAD_REQUEST);
      }

      const bookData = await this.bookcopyRepository.query(
        `SELECT * FROM book_copies WHERE barcode = $1 AND is_available = false LIMIT 1`,
        [booklogpayload.barcode],
      );

      if (bookData.length === 0) {
        console.error(' Invalid Book UUID:', booklogpayload.book_uuid);
        throw new HttpException('Invalid Barcode', HttpStatus.BAD_REQUEST);
      }

      const newData = await this.bookcopyRepository.query(
        `UPDATE book_copies SET is_available = true WHERE book_copy_uuid = $1 RETURNING *`,
        [bookData[0].book_copy_uuid],
      );

      const newTitle = await this.booktitleRepository.query(
        `UPDATE book_titles SET available_count = available_count + 1 
          WHERE book_uuid = $1 RETURNING *`,
        [bookData[0].book_title_uuid],
      );

      const oldBookCopy = bookData[0];
      const newBookCopyData = newData[0];
      const newBookTitleData = newTitle[0];

      const insertLogQuery = `
      INSERT INTO book_logv2 
        (person, borrower_uuid, new_booktitle, old_bookcopy, new_bookcopy, action, description, ip_address, time,  book_uuid, book_copy_uuid) 
        VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), $9, $10)
      `;

      const insertLogValues = [
        booklogpayload.student_uuid,
        booklogpayload.student_uuid,
        JSON.stringify(newBookTitleData),
        JSON.stringify(oldBookCopy),
        JSON.stringify(newBookCopyData),
        'returned',
        'Book has been returned',
        ipAddress,
        newBookTitleData[0].book_uuid,
        newBookCopyData[0].book_copy_uuid,
      ];

      await this.booktitleRepository.query(insertLogQuery, insertLogValues);
      return { message: 'Book returned successfully' };

      // Check if student exists
    } catch (error) {
      console.error('Error restoring book:', error);
      throw new HttpException(
        'Error restoring book',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createBookborrowed(
    booklogpayload: TCreateBooklogDTO,
    ipAddress: string,
  ) {
    try {
      const studentExists = await this.sudentRepository.query(
        `SELECT * FROM students_table WHERE student_uuid = $1`,
        [booklogpayload.student_uuid],
      );

      if (studentExists.length === 0) {
        console.error(' Invalid Student UUID:', booklogpayload.student_uuid);
        throw new HttpException('Invalid Student UUID', HttpStatus.BAD_REQUEST);
      }

      const bookData = await this.bookcopyRepository.query(
        `SELECT * FROM book_copies WHERE barcode = $1 AND is_available = true LIMIT 1`,
        [booklogpayload.barcode],
      );

      if (bookData.length === 0) {
        console.error(' Invalid Book UUID:', booklogpayload.book_uuid);
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
        (person, borrower_uuid, new_booktitle, old_bookcopy, new_bookcopy, action, description, ip_address, time,  book_uuid, book_copy_uuid)  
        VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), $9, $10)
      `;

      const insertLogValues = [
        booklogpayload.student_uuid,
        booklogpayload.student_uuid,
        JSON.stringify(newBookTitleData),
        JSON.stringify(oldBookCopy),
        JSON.stringify(newBookCopyData),
        'borrowed',
        'Book has been borrowed',
        ipAddress,
        newBookTitleData[0].book_uuid,
        newBookCopyData[0].book_copy_uuid,
      ];

      await this.booktitleRepository.query(insertLogQuery, insertLogValues);
      return { message: 'Book borrowed successfully' };
    } catch (error) {
      console.error(' Error issuing book:', error);
      throw new HttpException(
        'Error issuing book',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async setbooklibrary(booklogpayload: TCreateBooklogDTO, ipAddress: string) {
    try {
      // Validate student existence
      const studentExists = await this.sudentRepository.query(
        `SELECT * FROM students_table WHERE student_uuid = $1`,
        [booklogpayload.student_uuid],
      );

      if (studentExists.length === 0) {
        console.error(' Invalid Student UUID:', booklogpayload.student_uuid);
        throw new HttpException('Invalid Student UUID', HttpStatus.BAD_REQUEST);
      }

      const bookData = await this.bookcopyRepository.query(
        `SELECT * FROM book_copies WHERE (barcode=$1 AND is_available=true)`,
        [booklogpayload.barcode],
      );

      if (bookData.length === 0) {
        console.error(' Invalid Book UUID:', booklogpayload.book_uuid);
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
        (person, borrower_uuid, new_booktitle, old_bookcopy, new_bookcopy, action, description, ip_address, time, book_uuid, book_copy_uuid) 
        VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), $9, $10)
      `;

      console.log({newBookTitleData, newBookCopyData});

      const insertLogValues = [
        booklogpayload.student_uuid,
        booklogpayload.student_uuid,
        JSON.stringify(newBookTitleData),
        JSON.stringify(oldBookCopy),
        JSON.stringify(newBookCopyData),
        'read',
        'Book has been borrowed to be read in the library',
        ipAddress,
        newBookTitleData[0].book_uuid,
        newBookCopyData[0].book_copy_uuid,
      ];

      await this.booktitleRepository.query(insertLogQuery, insertLogValues);
      return { message: 'Book borrowed successfully' };
    } catch (error) {
      console.error('Error setting book in library:', error);
      throw new HttpException(
        'Error setting book in library',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  // visit log

  async getallvisitlog(){
    try {
     return await this.booktitleRepository.query(
        `select * from visit_log`
        
      );
    } catch (error) {
      throw new HttpException(
        `Error ${error} setting book in library`,
        HttpStatus.INTERNAL_SERVER_ERROR,);
    }
  }

  async visitlogentry(student_uuid: string) {
    try {
     const result=await this.booktitleRepository.query(`SELECT * FROM STUDENTS_TABLE WHERE STUDENT_UUID=$1`,[student_uuid])
     if (result.length === 0) {
      throw new HttpException(
        { message: "Invalid student ID" },
        HttpStatus.BAD_REQUEST
      );
    }
     await this.booktitleRepository.query(
        `INSERT INTO visit_log (student_uuid, action) VALUES ($1, 'entry')`,
        [student_uuid]
      );
      return {
        message: "Visit log entry created successfully",
        student_uuid: student_uuid,
        timestamp: new Date().toISOString(), // Adding timestamp for clarity
      };
    } catch (error) {
      throw new HttpException(
        `Error ${error} setting book in library`,
        HttpStatus.INTERNAL_SERVER_ERROR,);
    }
  } 

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

async visitlogexit(student_uuid: string) {
  try {
      // Check if student exists
      const studentExists = await this.booktitleRepository.query(
          `SELECT * FROM STUDENTS_TABLE WHERE STUDENT_UUID=$1`, 
          [student_uuid]
      );

      if (studentExists.length === 0) {
          throw new HttpException(
              { message: "Invalid student ID" },
              HttpStatus.BAD_REQUEST
          );
      }

      // Check if the student has an 'entry' log before inserting 'exit'
      const validation = await this.booktitleRepository.query(
          `SELECT * FROM visit_log WHERE student_uuid=$1 AND action='entry' ORDER BY timestamp DESC LIMIT 1`,
          [student_uuid]
      );

      if (validation.length === 0) {
          throw new HttpException(
              { message: "No prior entry log found. Entry is required before exit." },
              HttpStatus.BAD_REQUEST
          );
      }

      // Insert exit log
      await this.booktitleRepository.query(
          `INSERT INTO visit_log (student_uuid, action) VALUES ($1, 'exit')`,
          [student_uuid]
      );

      return {
          message: "Exit log created successfully",
          student_uuid: student_uuid,
          timestamp: new Date().toISOString(),
      };

  } catch (error) {
      throw new HttpException(
          `Error: ${error.message || error} while processing visit log`,
          HttpStatus.INTERNAL_SERVER_ERROR
      );
  }
}


}
