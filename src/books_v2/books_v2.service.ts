import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookCopy, TBookCopy } from './entity/books_v2.copies.entity';
import { BookTitle, TBookTitle } from './entity/books_v2.title.entity';
import { TCreateBookZodDTO } from './zod/createbookdtozod';
import {
  insertQueryHelper,
  selectQueryHelper,
  updateQueryHelper,
} from 'src/misc/custom-query-helper';
import { TUpdatebookZodDTO } from './zod/updatebookdto';
import { TCreateBooklogDTO } from 'src/book_log/zod/createbooklog';
import { student, Students, TStudents } from 'src/students/students.entity';
import { Booklog_v2, booklogV2, TBooklog_v2 } from './entity/book_logv2.entity';
import { genBookId, genBookId2 } from './create-book-id';
import { TupdatearchiveZodDTO } from './zod/uarchive';
import { TRestoreZodDTO } from './zod/restorearchive';
import { TCopyarchiveZodDTO } from './zod/archivebookcopy';
import { CreateBookCopyDTO } from './zod/createcopydto';
import { TRestorecopybookZodDTO } from './zod/restorebookcopies';
import { TUpdatebookcopyZodDTO } from './zod/updatebookcopy';
import { TCreateBooklogV2DTO } from './zod/create-booklogv2-zod';
import { createObjectOmitProperties } from 'src/misc/create-object-from-class';
import type { Request } from 'express';
import { TUpdateInstituteZodDTO } from './zod/updateinstituteid';
import {
  fees_penalties,
  FeesPenalties,
  TFeesPenalties,
} from 'src/fees-penalties/entity/fees-penalties.entity';
import { CalculateDaysFromDate } from 'src/misc/calculate-diff-bw-date';
import { createNewDate } from 'src/misc/create-new-date';
import { TUpdateFeesPenaltiesZod } from './zod/update-fp-zod';
import { number, object } from 'zod';
import { TbookUUIDZod } from './zod/bookuuid-zod';
import { Chunkify } from 'src/worker-threads/chunk-array';
import { CreateWorker } from 'src/worker-threads/worker-main-thread';
import {
  TRequestBookZodIssue,
  TRequestBookZodIssueReIssueAR,
  TRequestBookZodReIssue,
  TReturnBookZodReIssue,
} from './zod/requestbook-zod';
import { RequestBook, TRequestBook } from './entity/request-book.entity';
import { TUpdateResult } from 'src/worker-threads/student/student-archive-worker';
import { TInsertResult } from 'src/worker-threads/worker-types/book-insert.type';
import { QueryBuilderService } from 'src/query-builder/query-builder.service';

export interface Data<T> {
  data: T;
  pagination: null;
}

@Injectable()
export class BooksV2Service {
  constructor(
    @InjectRepository(BookCopy)
    private readonly bookcopyRepository: Repository<BookCopy>,

    @InjectRepository(BookTitle)
    private readonly booktitleRepository: Repository<BookTitle>,

    @InjectRepository(Students)
    private readonly studentRepository: Repository<Students>,

    @InjectRepository(Booklog_v2)
    private readonly booklogRepository: Repository<Booklog_v2>,

    @InjectRepository(FeesPenalties)
    private readonly fpRepository: Repository<FeesPenalties>,

    @InjectRepository(RequestBook)
    private readonly requestBooklogRepository: Repository<RequestBook>,

    private readonly queryBuilderService: QueryBuilderService,
  ) {}

  async getBooks(
    { page, limit, search }: { page: number; limit: number; search: string } = {
      page: 1,
      limit: 10,
      search: '',
    },
  ) {
    try {
      //console.log(page, limit, search);
      const offset = (page - 1) * limit;
      const searchQuery = search ? `${search}%` : '%';

      const books = await this.booktitleRepository.query(
        `SELECT * FROM book_titles WHERE book_title LIKE $1 AND is_archived = false AND available_count > 0 AND total_count > 0  LIMIT $2 OFFSET $3;`,
        [searchQuery, limit, offset],
      );
      if (books.length === 0) {
        throw new HttpException('Book data not found', HttpStatus.NOT_FOUND);
      }
      const total = await this.booktitleRepository.query(
        `SELECT COUNT(*) as count FROM book_titles 
        WHERE is_archived = false AND book_title ILIKE $1 AND available_count >0 AND total_count >0`,
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

  async getBookJournal(
    {
      book_journal_page,
      book_journal_limit,
      book_journal_search,
    }: {
      book_journal_page: number;
      book_journal_limit: number;
      book_journal_search: string;
    } = {
      book_journal_page: 1,
      book_journal_limit: 10,
      book_journal_search: '',
    },
    {
      note_page,
      note_limit,
      note_search,
    }: { note_page: number; note_limit: number; note_search: string } = {
      note_page: 1,
      note_limit: 10,
      note_search: '',
    },
  ) {
    try {
      const book_journal_searchQuery = book_journal_search
        ? `${book_journal_search}%`
        : '%';
      const book_journal_pageQuery =
        (book_journal_page - 1) * book_journal_limit;
      const book_journal_limitQuery = book_journal_limit;

      const books: any[] = await this.booktitleRepository.query(
        `SELECT book_title_id AS id, book_title AS title, book_author AS author, name_of_publisher AS publisher, available_count AS count, isbn AS isbn_issn, year_of_publication 
        FROM book_titles WHERE book_title ILIKE $1 AND is_archived = false AND available_count > 0 AND total_count > 0 LIMIT $2 OFFSET $3`,
        [
          book_journal_searchQuery,
          book_journal_limitQuery,
          book_journal_pageQuery,
        ],
      );
      console.log('working');

      const notes: any[] = await this.booktitleRepository.query(
        `SELECT * FROM notes WHERE is_archived = false AND is_approved = true`,
      );

      const totalBooks = await this.booktitleRepository.query(
        `SELECT COUNT(*) as count FROM book_titles 
        WHERE is_archived = false AND available_count > 0 AND total_count > 0`,
      );
      const totalNotes = await this.booktitleRepository.query(
        `SELECT COUNT(*) as count FROM notes WHERE is_archived = FALSE AND is_approved = TRUE`,
      );
      console.log(totalNotes, totalBooks);
      return {
        book_journal: books,
        book_journal_pagination: {
          total: parseInt(totalBooks[0].count, 10),
          book_journal_page,
          book_journal_limit,
          totalPages: Math.ceil(
            parseInt(totalBooks[0].count, 10) / book_journal_limit,
          ),
        },
      };
    } catch (error) {
      throw error;
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

      const book = await this.booktitleRepository.query(
        query.concat(' LIMIT 1'),
        queryParams,
      );

      const reviews = await this.booktitleRepository.query(
        `
        SELECT re.star_rating, re.review_text, re.created_at, st.student_name, st.student_id FROM reviews re LEFT JOIN students_table st ON re.student_uuid = st.student_uuid WHERE book_uuid = $1 AND is_approved = true`,
        [book_uuid],
      );

      if (book.length === 0) {
        throw new HttpException('Book not found', HttpStatus.NOT_FOUND);
      }

      return [{ ...book[0], reviews }];
    } catch (error) {
      console.log(error);
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
      if (books.length === 0) {
        throw new HttpException('Book data not found', HttpStatus.NOT_FOUND);
      }
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
      //console.log(error);
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
    page,
    limit,
    search,
    asc,
    dec,
    filter,
  }: {
    book_uuid: string;
    isbn: string;
    titlename: string;
    page: number;
    limit: number;
    asc: string[];
    dec: string[];
    filter: { field: string; value: (string | number)[]; operator: string }[];
    search: { field: string; value: string }[];
  }) {
    try {
      const offset = (page - 1) * limit;
      const queryParams: string[] = [];
      let query = `SELECT book_uuid, book_title FROM book_titles WHERE 1=1 `;

      if (book_uuid) {
        query += ` AND book_uuid = $${queryParams.length + 1}`;
        queryParams.push(book_uuid);
      }
      if (isbn) {
        query += ` AND isbn = $${queryParams.length + 1}`;
        queryParams.push(isbn);
      }
      if (titlename) {
        query += ` AND book_title LIKE $${queryParams.length + 1} `;
        queryParams.push(`${titlename}%`);
      }
      //console.log(query, queryParams);
      const book = await this.booktitleRepository.query(query, queryParams);

      //console.log({ book });
      //console.log('THIS IS THE UUID', book[0]);

      if (book.length === 0) {
        throw new HttpException('Book not found', HttpStatus.NOT_FOUND);
      }

      const params: (string | number)[] = [];

      filter.push({
        field: 'book_copies.is_archived',
        value: ['false'],
        operator: '=',
      });
      filter.push({
        field: 'book_copies.book_title_uuid',
        value: [book[0].book_uuid],
        operator: '=',
      });
      dec.push('book_copies.created_at');
      console.log({ filter, asc, dec });
      const whereClauses = this.queryBuilderService.buildWhereClauses(
        filter,
        search,
        params,
      );
      const orderByQuery = this.queryBuilderService.buildOrderByClauses(
        asc,
        dec,
      );

      console.log({ whereClauses, orderByQuery, params });

      const books = await this.bookcopyRepository.query(
        `   SELECT 
    book_titles.book_title, 
    book_titles.book_uuid,
    book_titles.book_title_id,
    book_copies.book_copy_uuid,
    book_copies.source_of_acquisition,
    book_copies.date_of_acquisition,
    book_copies.language,
    book_copies.barcode,
    book_copies.item_type,
    book_copies.is_archived,
    book_copies.created_at,
    book_copies.updated_at,
    book_copies.created_by,
    book_copies.remarks,
    book_copies.is_available,
    book_copies.book_title_uuid,
    book_copies.copy_images,
    book_copies.copy_additional_fields,
    book_copies.copy_description,
    book_copies.book_copy_id,
    book_copies.institute_uuid,
    book_copies.bill_no,
    book_copies.inventory_number,
    book_copies.accession_number
    FROM book_titles
    INNER JOIN book_copies ON book_copies.book_title_uuid = book_titles.book_uuid ${whereClauses} ${orderByQuery}  OFFSET $${params.length + 1} LIMIT $${params.length + 2} `,
        [...params, offset, limit],
      );

      const totalResult = await this.booktitleRepository.query(
        `SELECT COUNT(*) as total FROM book_copies where book_title_uuid = $1 and is_archived= false`,
        [book[0].book_uuid],
      );
      console.log({ books });
      if (books.length === 0) {
        throw new HttpException('Book not found', HttpStatus.NOT_FOUND);
      }
      return {
        data: books,
        pagination: {
          total: parseInt(totalResult[0].total, 10),
          page,
          limit,
          totalPages: Math.ceil(parseInt(totalResult[0].total, 10) / limit),
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
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
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
      //console.log(page, limit, search);
      const offset = (page - 1) * limit;
      const searchQuery = search ? `%${search}%` : '%';

      const books = await this.booktitleRepository.query(
        `SELECT * FROM book_titles 
        WHERE is_archived = true AND book_title ILIKE $1
        LIMIT $2 OFFSET $3`,
        [searchQuery, limit, offset],
      );
      // console.log(books);
      if (books.length === 0) {
        throw new HttpException(
          'Archived Book data not found',
          HttpStatus.NOT_FOUND,
        );
      }

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
      //console.log(error);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
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
      if (books.length === 0) {
        throw new HttpException(
          'Archived Book data not found',
          HttpStatus.NOT_FOUND,
        );
      }
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
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getavailablebookbyisbn({
    isbn,
    page,
    limit,
  }: {
    isbn: string;
    page: number;
    limit: number;
  }) {
    try {
      const offset = (page - 1) * limit;

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
        WHERE book_title_uuid = $1 AND is_available = true AND is_archived = false LIMIT $2 OFFSET $3`,
        [bookTitle[0].book_uuid, limit, offset],
      );
      const total = await this.bookcopyRepository.query(
        `
        SELECT count(*)
          FROM book_copies 
        WHERE book_title_uuid = $1 AND is_available = true AND is_archived = false`,
        [bookTitle[0].book_uuid],
      );
      return {
        data: result,
        pagination: {
          total: parseInt(total[0].count, 10),
          page,
          limit,
          totalPages: Math.ceil(parseInt(total[0].count, 10) / limit),
        },
      };
    } catch (error) {
      console.error('Error getting book in library:', error);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
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
      if (books.length === 0) {
        throw new HttpException('Book data not found', HttpStatus.NOT_FOUND);
      }
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
      throw error;
    }
  }

  async getunavailablebookbyisbn({
    isbn,
    page,
    limit,
  }: {
    isbn: string;
    page: number;
    limit: number;
  }) {
    try {
      const offset = (page - 1) * limit;

      const bookTitle = await this.booktitleRepository.query(
        `
        SELECT * FROM book_titles
        WHERE isbn = $1
        LIMIT 1
        `,
        [isbn],
      );
      if (bookTitle.length == 0) {
        throw new HttpException('invalid isbn !!', HttpStatus.BAD_REQUEST);
      }
      //console.log({ bookTitle });
      const result = await this.bookcopyRepository.query(
        `
        SELECT *
          FROM book_copies 
        WHERE book_title_uuid = $1 AND is_available = false AND is_archived = false`,
        [bookTitle[0].book_uuid],
      );
      const total = await this.bookcopyRepository.query(
        `
        SELECT count (*)
          FROM book_copies 
        WHERE book_title_uuid = $1 AND is_available = false AND is_archived = false LIMIT $2 OFFSET $3`,
        [bookTitle[0].book_uuid, limit, offset],
      );
      //console.log(result);
      return {
        data: result,
        pagination: {
          total: parseInt(total[0].total, 10),
          page,
          limit,
          totalPages: Math.ceil(parseInt(total[0].total, 10) / limit),
        },
      };
    } catch (error) {
      throw error;
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
      if (books.length === 0) {
        throw new HttpException('Book data not found', HttpStatus.NOT_FOUND);
      }

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
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
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
        `SELECT book_logv2.action,book_logv2.new_book_title,book_logv2.new_book_copy,fees_penalties.created_at , students_table.student_name FROM book_logv2 INNER JOIN students_table ON students_table.student_uuid = book_logv2.borrower_uuid INNER JOIN fees_penalties ON book_logv2.fp_uuid=fees_penalties.fp_uuid LIMIT $1 OFFSET $2`,
        [limit, offset],
      );
      const total = await this.booklogRepository.query(
        `SELECT COUNT(*) as count FROM book_logv2`,
      );
      if (studentLogs.length === 0) {
        throw new HttpException(
          'Book log data not found',
          HttpStatus.NOT_FOUND,
        );
      }
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
      console.log(error);
      throw error;
    }
  }

  async getLogDetailsByTitle({
    book_title_id,
    isbn,
    page,
    limit,
  }: {
    book_title_id: string;
    isbn: string;
    page: number;
    limit: number;
  }) {
    try {
      const offset = (page - 1) * limit;
      let query = `SELECT book_copy_uuid, new_book_copy, new_book_title, action, date, book_uuid, book_title, book_author, isbn, department, author_mark, available_count, total_count
      FROM book_logv2 INNER JOIN book_titles ON book_titles.book_uuid = book_logv2.book_title_uuid`;
      const queryValue: string[] = [];

      if (book_title_id) {
        query = query.concat(
          ` AND book_titles.book_title_id = $${queryValue.length + 1}`,
        );
        queryValue.push(book_title_id);
      }
      if (isbn) {
        query = query.concat(
          ` AND book_titles.isbn = $${queryValue.length + 1}`,
        );
        queryValue.push(isbn);
      }
      query = query.concat(
        ` LIMIT $${queryValue.length + 1} OFFSET $${queryValue.length + 2}`,
      );
      queryValue.push(`${limit}`);
      queryValue.push(`${offset}`);

      const totalResult = await this.bookcopyRepository.query(
        `SELECT count(*) FROM book_logv2 INNER JOIN book_titles ON book_titles.book_uuid = book_logv2.book_title_uuid  WHERE (book_titles.isbn= $1  OR book_titles.book_title_id= $2)`,
        [isbn, book_title_id],
      );

      const logs = await this.booklogRepository.query(query, queryValue);
      return {
        data: logs,
        agination: {
          total: parseInt(totalResult[0].count, 10),
          page,
          limit,
          totalPages: Math.ceil(parseInt(totalResult[0].count, 10) / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }
  async getLogDetailsByCopy({
    barcode,
    page,
    limit,
  }: {
    barcode: string;
    page: number;
    limit: number;
  }) {
    try {
      const offset = (page - 1) * limit;
      const book: { book_copy_uuid: string }[] =
        await this.bookcopyRepository.query(
          `SELECT book_copy_uuid FROM book_copies 
        WHERE barcode = $1`,
          [barcode],
        );

      //console.log('Book', book[0]);

      const logs = await this.booklogRepository.query(
        `SELECT * FROM book_logv2 
        WHERE book_copy_uuid = $1  LIMIT $2 OFFSET $3`,
        [book[0].book_copy_uuid, limit, offset],
      );
      if (logs.length === 0) {
        throw new HttpException(
          'Book log data not found',
          HttpStatus.NOT_FOUND,
        );
      }
      const totalCount = await this.booklogRepository.query(
        `SELECT COUNT(*) FROM book_logv2 WHERE book_copy_uuid = $1`,
        [book[0].book_copy_uuid],
      );

      return {
        data: logs,
        pagination: {
          totalCount: parseInt(totalCount[0].count, 10),
          page,
          limit,
          totalPages: Math.ceil(parseInt(totalCount[0].count, 10) / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async getLogDetailsOfStudent({
    student_id,
    page,
    limit,
  }: {
    student_id: string;
    page: number;
    limit: number;
  }) {
    try {
      const offset = (page - 1) * limit;
      const result: any[] = await this.booklogRepository.query(
        `SELECT * FROM book_logv2 WHERE borrower_uuid = $1 ORDER BY time DESC  LIMIT $2 OFFSET $3
        `,
        //         ` SELECT  book_copies.book_copy_id, book_titles.book_title, fees_penalties.created_at, fees_penalties.returned_at, book_titles.department FROM book_titles INNER JOIN book_copies ON book_titles.book_uuid= book_copies.book_title_uuid
        //           INNER JOIN fees_penalties ON fees_penalties.book_copy_uuid =book_copies.book_copy_uuid
        //          INNER JOIN students_table ON fees_penalties.borrower_uuid = students_table.student_uuid  WHERE student_id=$1
        //  LIMIT $2 OFFSET $3`,
        [student_id, limit, offset],
      );
      const totalCount = await this.booklogRepository.query(
        `SELECT COUNT(*) FROM book_logv2 WHERE borrower_uuid = $1`,
        //         `SELECT COUNT(*)
        //         FROM book_titles
        //         INNER JOIN book_copies ON book_titles.book_uuid = book_copies.book_title_uuid
        //         INNER JOIN fees_penalties ON fees_penalties.book_copy_uuid = book_copies.book_copy_uuid
        //         INNER JOIN students_table ON fees_penalties.borrower_uuid = students_table.student_uuid
        //         WHERE student_id = $1;
        // `,
        [student_id],
      );
      if (result.length === 0) {
        throw new HttpException(
          'Book log data not found',
          HttpStatus.NOT_FOUND,
        );
      }
      return {
        data: result,
        pagination: {
          total: parseInt(totalCount[0].count, 10),
          page,
          limit,
          totalPages: Math.ceil(parseInt(totalCount[0].count, 10) / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async getCurrentBorrowedOfStudent({
    student_id,
    page,
    limit,
  }: {
    student_id: string;
    page: number;
    limit: number;
  }) {
    try {
      const offset = (page - 1) * limit;
      const result: any[] = await this.booklogRepository.query(
        `SELECT bt.book_title, bt.book_uuid, bc.barcode, bt.department, fp.created_at FROM fees_penalties fp LEFT JOIN book_copies bc ON fp.copy_uuid = bc.book_copy_uuid LEFT JOIN 
        book_titles bt ON bc.book_title_uuid = bt.book_uuid 
        WHERE fp.created_at < CURRENT_DATE AND fp.is_completed = false AND fp.borrower_uuid = $1 ORDER BY fp.created_at DESC  LIMIT $2 OFFSET $3
        `,
        //         ` SELECT  book_copies.book_copy_id, book_titles.book_title, fees_penalties.created_at, fees_penalties.returned_at, book_titles.department FROM book_titles INNER JOIN book_copies ON book_titles.book_uuid= book_copies.book_title_uuid
        //           INNER JOIN fees_penalties ON fees_penalties.book_copy_uuid =book_copies.book_copy_uuid
        //          INNER JOIN students_table ON fees_penalties.borrower_uuid = students_table.student_uuid  WHERE student_id=$1
        //  LIMIT $2 OFFSET $3`,
        [student_id, limit, offset],
      );
      const totalCount = await this.booklogRepository.query(
        `SELECT COUNT(*) FROM fees_penalties WHERE return_date < CURRENT_DATE AND is_completed = false AND borrower_uuid = $1`,
        //         `SELECT COUNT(*)
        //         FROM book_titles
        //         INNER JOIN book_copies ON book_titles.book_uuid = book_copies.book_title_uuid
        //         INNER JOIN fees_penalties ON fees_penalties.book_copy_uuid = book_copies.book_copy_uuid
        //         INNER JOIN students_table ON fees_penalties.borrower_uuid = students_table.student_uuid
        //         WHERE student_id = $1;
        // `,
        [student_id],
      );
      if (result.length === 0) {
        throw new HttpException(
          'Book log data not found',
          HttpStatus.NOT_FOUND,
        );
      }
      return {
        data: result,
        pagination: {
          total: parseInt(totalCount[0].count, 10),
          page,
          limit,
          totalPages: Math.ceil(parseInt(totalCount[0].count, 10) / limit),
        },
      };
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
          updateBookPayload.year_of_publication,
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
      let bookTitleUUID: Pick<TBookTitle, 'book_uuid'>[] =
        await this.booktitleRepository.query(
          `SELECT book_uuid FROM book_titles WHERE isbn = $1`,
          [createBookpayload.isbn],
        );

      //Book Title Table logic
      if (!bookTitleUUID.length) {
        //Create the required Columns, Arg, and Values
        //Ignore the Columns that are used by Copy table
        const bookTitleQueryData = insertQueryHelper(createBookpayload, [
          'source_of_acquisition',
          'date_of_acquisition',
          'bill_no',
          'language',
          'inventory_number',
          'accession_number',
          'barcode',
          'item_type',
          'institute_name',
          'institute_uuid',
          'created_by',
          'remarks',
          'copy_images',
          'copy_description',
          'copy_additional_fields',
        ]);

        //Convert some specific fields to string
        bookTitleQueryData.values.forEach((element, idx) => {
          if (Array.isArray(element) || typeof element === 'object') {
            bookTitleQueryData.values[idx] = JSON.stringify(element);
          }
        });
        bookTitleUUID = await this.booktitleRepository.query(
          `INSERT INTO book_titles (${bookTitleQueryData.queryCol}) VALUES (${bookTitleQueryData.queryArg}) RETURNING book_uuid`,
          bookTitleQueryData.values,
        );
      } else {
        await this.booktitleRepository.query(
          `UPDATE book_titles SET total_count = total_count + 1, available_count = available_count + 1, updated_at = NOW() WHERE isbn = $1`,
          [createBookpayload.isbn],
        );
      }
      //Book Copy Table logic
      //This variable also includes book title payload
      const bookCopiesPayloadWithTitleUUID = Object.assign(createBookpayload, {
        //book_copy_id: bookId,
        book_title_uuid: bookTitleUUID[0].book_uuid,
      }) as TBookCopy & TBookTitle;

      //Create the required Columns, Arg, and Values
      //Ignore the Columns that are used by Title table
      const bookCopyQueryData = insertQueryHelper(
        bookCopiesPayloadWithTitleUUID,
        [
          'book_title',
          'book_author',
          'name_of_publisher',
          'place_of_publication',
          'year_of_publication',
          'edition',
          'isbn',
          'no_of_pages',
          'no_of_preliminary',
          'subject',
          'department',
          'call_number',
          'author_mark',
          'title_images',
          'title_description',
          'title_additional_fields',
        ],
      );

      //Convert some specific fields to string
      bookCopyQueryData.values.forEach((element, idx) => {
        if (Array.isArray(element) || typeof element === 'object') {
          bookCopyQueryData.values[idx] = JSON.stringify(element);
        }
      });

      await this.bookcopyRepository.query(
        `INSERT INTO book_copies (${bookCopyQueryData.queryCol}) VALUES (${bookCopyQueryData.queryArg})`,
        bookCopyQueryData.values,
      );
      return { statusCode: HttpStatus.CREATED, message: 'Book created' };
    } catch (error) {
      throw error;
    }
  }

  async bulkCreate(bookZodValidatedObject: {
    validated_array: TCreateBookZodDTO[];
    invalid_data_count: number;
  }) {
    const result = await CreateWorker<TInsertResult>(
      bookZodValidatedObject.validated_array,
      'book/book-insert-worker',
    );
    if (typeof result === 'object') {
      return {
        inserted_data: result.inserted_data,
        invalid_data: bookZodValidatedObject.invalid_data_count,
      };
    } else {
      throw new HttpException(result, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateTitleArchive(creatbookpayload: TupdatearchiveZodDTO) {
    try {
      //console.log(creatbookpayload.book_uuid);
      // Check if the book exists and is not archived
      const book = await this.booktitleRepository.query(
        `SELECT * FROM book_titles WHERE book_uuid =$1 AND is_archived = false`,
        [creatbookpayload.book_uuid],
      );
      //console.log({ book });

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
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
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

  async updateBookCopy(
    id: string,
    updateBookCopyPayload: TUpdatebookcopyZodDTO,
  ) {
    try {
      const bookCopy = await this.bookcopyRepository.query(
        `SELECT * FROM book_copies WHERE book_copy_uuid = $1 LIMIT 1`,
        [id],
      );

      //console.log({ bookCopy });

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
      //console.log(error);
      throw new HttpException(
        'Error updating book copy',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  //   async archiveBookCopy(book_copy_uuid: string) {
  //     try {
  //       // Archive the book copy and get the bookTitleUUID
  //       const archiveResult = await this.bookcopyRepository.query(
  //         `UPDATE book_copies
  //         SET is_archived = true
  //         WHERE book_copy_uuid = $1
  //         RETURNING book_title_uuid`,
  //         [book_copy_uuid],
  //       );
  // console.log("working1");
  //       if (archiveResult.length === 0) {
  //         throw new Error('Book copy not found or already archived');
  //       }

  //       const bookTitleUUID = archiveResult[0][0].book_title_uuid;
  //       console.log("working2");
  //       console.log({ bookTitleUUID });

  //       // Reduce total_count and available_count in book_titles
  //       await this.booktitleRepository.query(
  //         `UPDATE book_titles
  //         SET
  //         total_count = GREATEST(total_count - 1, 0),
  //           available_count = GREATEST(available_count - 1, 0)
  //         WHERE book_uuid = $1`,
  //         [book_copy_uuid],
  //       );
  //     //  const count= await this.booktitleRepository.query(`SELECT COUNT(*) FROM book_copies WHERE book_title_uuid=$1`,[book_copy_uuid])
  //       //  await this.booktitleRepository.query(
  //       //   `UPDATE book_titles
  //       //   SET
  //       //   total_count =$2 ,
  //       //     available_count =$2
  //       //   WHERE book_uuid = $1`,
  //       //   [bookTitleUUID,count],
  //       // );
  //       console.log("working3");
  //       return { success: true, message: 'Book copy archived successfully' };
  //     } catch (error) {
  //       console.log(error);
  //       throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
  //     }
  //   }

  async archiveBookCopy(book_copy_uuid: string) {
    try {
      //console.log("Archiving book copy...");

      const validid = await this.bookcopyRepository.query(
        `SELECT * FROM book_copies WHERE book_copy_uuid= $1 and is_archived=false`,
        [book_copy_uuid],
      );
      if (validid.length == 0) {
        throw new HttpException(
          'Book is already is archived !!',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Archive the book copy and get the bookTitleUUID
      const archiveResult = await this.bookcopyRepository.query(
        `UPDATE book_copies SET is_archived = true WHERE book_copy_uuid = $1 AND is_available = TRUE RETURNING book_title_uuid`,
        [book_copy_uuid],
      );

      //console.log("Archive result:", archiveResult);

      // Ensure that a book copy was updated
      if (!archiveResult.length) {
        throw new Error(
          'Book copy not found or already archived or is being borrowed',
        );
      }

      // Extract bookTitleUUID correctly
      const bookTitleUUID = archiveResult[0][0].book_title_uuid;
      //console.log("Book Title UUID:", bookTitleUUID);

      // Retrieve the updated count of book copies for this title
      const countResult = await this.bookcopyRepository.query(
        `SELECT COUNT(*) AS total FROM book_copies WHERE book_title_uuid = $1 AND is_archived = false`,
        [bookTitleUUID],
      );

      const totalCount = parseInt(countResult[0].total, 10);
      console.log('Updated book copy count:', totalCount);

      // Update total_count and available_count in book_titles
      await this.booktitleRepository.query(
        `UPDATE book_titles 
      SET 
        total_count = $1, 
        available_count = $1
      WHERE book_uuid = $2`,
        [totalCount, bookTitleUUID],
      );

      //console.log("Book title counts updated.");
      return { success: true, message: 'Book copy archived successfully' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
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
      //console.log(error);
      throw new HttpException(
        'Error restoring book',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async bulkDelete(arrBookUUIDPayload: {
    validated_array: TbookUUIDZod[];
    invalid_data_count: number;
  }) {
    try {
      const zodValidatedBatchArr: TbookUUIDZod[][] = Chunkify(
        arrBookUUIDPayload.validated_array,
      );
      const BatchArr: Promise<TUpdateResult>[] = [];
      for (let i = 0; i < zodValidatedBatchArr.length; i++) {
        const result = CreateWorker<TUpdateResult>(
          zodValidatedBatchArr[i],
          'book/book-archive-worker',
        );
        BatchArr.push(result);
      }
      const arrOfWorkerRes = (await Promise.all(BatchArr)).flat();
      const { archived_data, failed_archived_data } = arrOfWorkerRes.reduce(
        (prevItem, currItem) => {
          return {
            archived_data: prevItem.archived_data + currItem.archived_data,
            failed_archived_data:
              prevItem.failed_archived_data + currItem.failed_archived_data,
          };
        },
      );
      return {
        invalid_data: arrBookUUIDPayload.invalid_data_count,
        archived_data,
        failed_archived_data,
      };
    } catch (error) {
      throw error;
    }
  }

  async isbnBook(isbn: string) {
    const result = await this.booktitleRepository.query(
      `
      SELECT book_copies.source_of_acquisition, book_copies.date_of_acquisition, book_copies.bill_no,book_copies.
      language,book_copies.inventory_number, book_copies.accession_number,book_copies.barcode,book_copies.item_type,book_copies.remarks,
      book_titles.book_title,book_titles.book_author,book_titles.name_of_publisher,book_titles.place_of_publication,book_titles.year_of_publication,
      book_titles.edition,book_titles.subject,book_titles.department,book_titles.call_number,book_titles.author_mark,book_titles.title_images,
      book_titles.title_additional_fields,book_titles.title_description,book_titles.no_of_pages,book_titles.no_of_preliminary,
      book_titles.isbn FROM book_titles INNER JOIN book_copies on book_titles.book_uuid = book_copies.book_title_uuid where book_titles.isbn= $1 LIMIT 1
   `,
      [isbn],
    );
    if (result.length === 0) {
      throw new Error('No data found');
    }
    return result;
  }

  async bookReturned(
    booklogPayload: Omit<TCreateBooklogV2DTO, 'action'>,
    ipAddress: string,
    status: 'returned',
  ) {
    try {
      const studentExists: { student_uuid: string }[] =
        await this.studentRepository.query(
          `SELECT student_uuid FROM students_table WHERE student_id = $1 AND is_archived = FALSE`,
          [booklogPayload.student_id],
        );

      if (!studentExists.length) {
        throw new HttpException('Cannot find Student ID', HttpStatus.NOT_FOUND);
      }

      //Check if Book exists in Book Copies as not available
      //Insert into old_book_copy COLUMN
      const bookPayloadFromBookCopies: TBookCopy[] =
        await this.bookcopyRepository.query(
          `SELECT * FROM book_copies WHERE book_copy_id = $1 AND is_available = false AND is_archived = false`,
          [booklogPayload.book_copy_id],
        );

      if (!bookPayloadFromBookCopies.length) {
        throw new HttpException(
          'Cannot find Borrowed Book',
          HttpStatus.NOT_FOUND,
        );
      }

      const bookBorrowedPayload: TBooklog_v2[] =
        await this.booklogRepository.query(
          `SELECT * FROM book_logv2 WHERE borrower_uuid = $1 AND book_copy_uuid = $2 
        AND (action = 'borrowed' OR action = 'in_library_borrowed')`,
          [
            studentExists[0].student_uuid,
            bookPayloadFromBookCopies[0].book_copy_uuid,
          ],
        );

      //if student doesn't exist in Booklog table (it hasn't borrowed), or it isn't the book that it borrowed, but attempting to return it
      if (!bookBorrowedPayload.length) {
        throw new HttpException(
          "Student hasn't borrowed at all, or Invalid Book is being returned",
          HttpStatus.NOT_FOUND,
        );
      }

      //Check if Book hasn't reached its total count in Book Titles through book_title_uuid received from Book Copies via SELECT query
      //Insert into old_book_title COLUMN
      const bookPayloadFromBookTitle: TBookTitle[] =
        await this.bookcopyRepository.query(
          `SELECT * FROM book_titles WHERE book_uuid = $1 AND available_count != total_count AND is_archived = FALSE`,
          [bookPayloadFromBookCopies[0].book_title_uuid],
        );

      if (!bookPayloadFromBookTitle.length) {
        throw new HttpException(
          'Seems like Book is fully returned in Book Titles, but exists in Book Log as not returned',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      //UPDATING now is safe
      //Insert into new_book_copy
      const updatedBookCopiesPayload: [TBookCopy[], 0 | 1] =
        await this.bookcopyRepository.query(
          `UPDATE book_copies SET is_available = TRUE WHERE book_copy_uuid = $1 AND barcode = $2 
        AND is_available = FALSE AND is_archived = FALSE RETURNING *`,
          [
            bookPayloadFromBookCopies[0].book_copy_uuid,
            bookPayloadFromBookCopies[0].barcode,
          ],
        );

      const updateStatus = updatedBookCopiesPayload[1];
      if (!updateStatus) {
        //if somehow the update fails, even after getting the data through SELECT query
        throw new HttpException(
          'Failed to update Book',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      if (!updatedBookCopiesPayload[0].length) {
        //if for some reason update array response is empty, then
        throw new HttpException(
          'Something went wrong',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const bookTitleUUID = updatedBookCopiesPayload[0][0].book_title_uuid;
      const bookCopyUUID = updatedBookCopiesPayload[0][0].book_copy_uuid;

      //Insert into new_book_copy COLUMN
      const updatedBookTitlePayload: [TBookTitle[], 0 | 1] =
        await this.booktitleRepository.query(
          `UPDATE book_titles SET available_count = available_count + 1 WHERE book_uuid = $1 AND is_archived = FALSE RETURNING *`,
          [bookTitleUUID],
        );

      const oldBookCopy = JSON.stringify(bookPayloadFromBookCopies[0]);
      const newBookCopy = JSON.stringify(updatedBookCopiesPayload[0][0]);

      const oldBookTitle = JSON.stringify(bookPayloadFromBookTitle[0]);
      const newBookTitle = JSON.stringify(updatedBookTitlePayload[0][0]);

      const feesPenaltiesPayload: TFeesPenalties[] =
        await this.fpRepository.query(
          `SELECT * FROM fees_penalties WHERE borrower_uuid = $1 AND copy_uuid = $2 AND is_completed = FALSE`,
          [
            studentExists[0].student_uuid,
            bookBorrowedPayload[0].book_copy_uuid,
          ],
        );

      if (!feesPenaltiesPayload.length) {
        throw new HttpException(
          'Cannot find Fees and Penalties record',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      //Get the date of book being returned
      const returnedAt: Date = new Date();
      //Get return date from database (when the book has to be returned)
      const returnDate: Date = new Date(feesPenaltiesPayload[0].return_date);

      let delayedDays = CalculateDaysFromDate(returnedAt, returnDate);
      let isPenalised = true;
      let isCompleted = false;

      if (delayedDays <= 0) {
        //re intialize it to 0, since no delay
        delayedDays = 0;
        //No delay, no penalty, and return process Completed
        isPenalised = false;
        isCompleted = true;
      }

      //Assuming penalty amount per day is 50
      let penaltyAmount = delayedDays * 50;

      console.log(
        delayedDays,
        returnDate,
        returnedAt,
        isPenalised,
        penaltyAmount,
      );
      const fpUUID: [{ fp_uuid: string }[], 0 | 1] =
        await this.fpRepository.query(
          `UPDATE fees_penalties SET days_delayed = $1, penalty_amount = $2, is_penalised = $3, 
        returned_at = $4, is_completed = $5, updated_at = NOW()
        WHERE borrower_uuid = $6 AND copy_uuid = $7 AND is_completed = FALSE RETURNING fp_uuid`,
          [
            delayedDays,
            penaltyAmount,
            isPenalised,
            returnedAt,
            isCompleted,
            bookBorrowedPayload[0].borrower_uuid,
            bookBorrowedPayload[0].book_copy_uuid,
          ],
        );

      const updateStatusFP = fpUUID[1];
      //if update fails
      if (!updateStatusFP) {
        throw new HttpException(
          'Failed to update fees_penalties table',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      await this.booklogRepository.query(
        `INSERT INTO book_logv2 (
          borrower_uuid, book_copy_uuid, action, description, book_title_uuid,
          old_book_copy, new_book_copy, old_book_title, new_book_title, ip_address, fp_uuid
        ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          studentExists[0].student_uuid,
          bookCopyUUID,
          status,
          'Book has been returned',
          bookTitleUUID,
          oldBookCopy,
          newBookCopy,
          oldBookTitle,
          newBookTitle,
          ipAddress,
          fpUUID[0][0].fp_uuid,
        ],
      );

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Book returned successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  async bookBorrowed(
    booklogPayload: Omit<TCreateBooklogV2DTO, 'action'>,
    ipAddress: string,
    status: 'borrowed' | 'in_library_borrowed',
  ) {
    try {
      const studentExists: { student_uuid: string }[] =
        await this.studentRepository.query(
          `SELECT student_uuid FROM students_table WHERE student_id = $1 AND is_archived = FALSE`,
          [booklogPayload.student_id],
        );
      if (!studentExists.length) {
        throw new HttpException('Cannot find Student ID', HttpStatus.NOT_FOUND);
      }

      //Check if Book exists in Book Copies
      //Insert into old_book_copy COLUMN
      const bookPayloadFromBookCopies: TBookCopy[] =
        await this.bookcopyRepository.query(
          `SELECT * FROM book_copies WHERE book_copy_id = $1 AND is_available = TRUE AND is_archived = FALSE`,
          [booklogPayload.book_copy_id],
        );

      if (!bookPayloadFromBookCopies.length) {
        throw new HttpException('Cannot find Book', HttpStatus.NOT_FOUND);
      }

      console.log(bookPayloadFromBookCopies);

      //Check if Book exists in Book Titles through book_title_uuid received from Book Copies via SELECT query
      //Also make sure it's available
      //Insert into old_book_title COLUMN
      const bookPayloadFromBookTitle: TBookTitle[] =
        await this.bookcopyRepository.query(
          `SELECT * FROM book_titles WHERE book_uuid = $1 AND available_count > 0 AND is_archived = FALSE`,
          [bookPayloadFromBookCopies[0].book_title_uuid],
        );

      if (!bookPayloadFromBookTitle.length) {
        throw new HttpException(
          "Book doesn't seems to be available in Book Titles, but exists in Book Copies",
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      console.log(bookPayloadFromBookTitle);

      //assuming that borower is trying to borrow penalised book
      const feesPenaltiesPayload: TFeesPenalties[] =
        await this.fpRepository.query(
          `SELECT * FROM fees_penalties WHERE borrower_uuid = $1 AND copy_uuid = $2 AND is_completed = FALSE AND is_penalised = TRUE`,
          [
            studentExists[0].student_uuid,
            bookPayloadFromBookCopies[0].book_copy_uuid,
          ],
        );

      if (feesPenaltiesPayload.length) {
        throw new HttpException(
          'Cannot borrow this book, complete the penalty first',
          HttpStatus.BAD_REQUEST,
        );
      }

      console.log(feesPenaltiesPayload);

      //UPDATING now is safe
      //Insert into new_book_copy
      const updatedBookCopiesPayload: [TBookCopy[], 0 | 1] =
        await this.bookcopyRepository.query(
          `UPDATE book_copies SET is_available = FALSE WHERE book_copy_uuid = $1 AND barcode = $2 AND is_available = TRUE AND is_archived = FALSE
        RETURNING *`,
          [
            bookPayloadFromBookCopies[0].book_copy_uuid,
            bookPayloadFromBookCopies[0].barcode,
          ],
        );

      const updateStatus = updatedBookCopiesPayload[1];
      if (!updateStatus) {
        //if somehow the update fails, even after getting the data through SELECT query
        throw new HttpException(
          'Failed to update Book',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      if (!updatedBookCopiesPayload[0].length) {
        //if for some reason update array response is empty, then
        throw new HttpException(
          'Something went wrong',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const bookTitleUUID = updatedBookCopiesPayload[0][0].book_title_uuid;
      const bookCopyUUID = updatedBookCopiesPayload[0][0].book_copy_uuid;

      //Insert into new_book_copy COLUMN
      const updatedBookTitlePayload: [TBookTitle[], 0 | 1] =
        await this.booktitleRepository.query(
          `UPDATE book_titles SET available_count = available_count - 1 WHERE book_uuid = $1 AND is_archived = FALSE RETURNING *`,
          [bookTitleUUID],
        );

      const oldBookCopy = JSON.stringify(
        structuredClone(bookPayloadFromBookCopies[0]),
      );
      const newBookCopy = JSON.stringify(
        structuredClone(updatedBookCopiesPayload[0][0]),
      );

      const oldBookTitle = JSON.stringify(
        structuredClone(bookPayloadFromBookTitle[0]),
      );
      const newBookTitle = JSON.stringify(
        structuredClone(updatedBookTitlePayload[0][0]),
      );

      console.log({ oldBookCopy, newBookCopy, oldBookTitle, newBookTitle });

      let returnDays = 0;
      //if borrowed in library then return day 0, else incremented date
      if (status === 'in_library_borrowed') {
        returnDays = 0;
      } else {
        returnDays = 7;
      }
      const createReturnDate = createNewDate(returnDays);

      const fpUUID: { fp_uuid: string }[] = await this.fpRepository.query(
        `INSERT INTO fees_penalties (payment_method, borrower_uuid, copy_uuid, return_date, category) values ($1, $2, $3, $4, $5) RETURNING fp_uuid`,
        [
          'offline',
          studentExists[0].student_uuid,
          bookCopyUUID,
          createReturnDate,
          'book',
        ],
      );

      await this.booklogRepository.query(
        `INSERT INTO book_logv2 (
          borrower_uuid, book_copy_uuid, action, description, book_title_uuid,
          old_book_copy, new_book_copy, old_book_title, new_book_title, ip_address, fp_uuid
        ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          studentExists[0].student_uuid,
          bookCopyUUID,
          status,
          'Book has been borrowed',
          bookTitleUUID,
          oldBookCopy,
          newBookCopy,
          oldBookTitle,
          newBookTitle,
          ipAddress,
          fpUUID[0].fp_uuid,
        ],
      );

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Book borrowed successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  async setbooklibrary(booklogpayload: TCreateBooklogV2DTO, ipAddress: string) {
    try {
      // Validate student existence
      const studentExists = await this.studentRepository.query(
        `SELECT * FROM students_table WHERE student_uuid = $1 AND is_archived = FALSE`,
        [booklogpayload.student_id],
      );

      if (studentExists.length === 0) {
        console.error(' Invalid Student ID:', booklogpayload.student_id);
        throw new HttpException('Invalid Student UUID', HttpStatus.BAD_REQUEST);
      }

      const bookData = await this.bookcopyRepository.query(
        `SELECT * FROM book_copies WHERE (book_copy_id=$1 AND is_available=true)`,
        [booklogpayload.book_copy_id],
      );

      if (bookData.length === 0) {
        // console.error(' Invalid Book UUID:', booklogpayload.book_copy_id);
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
      //console.log('working');

      const result = await this.bookcopyRepository.query(
        `SELECT * FROM book_copies WHERE book_copy_uuid = $1`,
        [createinstitutepayload.book_copy_uuid],
      );

      //console.log('working1');

      if (result.length === 0) {
        throw new HttpException(
          'book_copy_uuid does not exist',
          HttpStatus.NOT_FOUND,
        );
      }

      await this.bookcopyRepository.query(
        `UPDATE book_copies SET institute_uuid = $1 WHERE book_copy_uuid = $2`,
        [
          createinstitutepayload.institute_uuid,
          createinstitutepayload.book_copy_uuid,
        ],
      );

      return {
        message: 'Institute ID updated successfully',
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      console.error(error);
      throw new HttpException(
        error.message || 'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // visit log

  //   async visitlogexit(student_uuid: string) {
  //     try {
  //      const data=await this.booktitleRepository.query(`SELECT * FROM STUDENTS_TABLE WHERE STUDENT_UUID = $1`,[student_uuid])
  //      if (data.length === 0) {
  //       throw new HttpException(
  //         { message: "Invalid student ID" },
  //         HttpStatus.BAD_REQUEST
  //       );
  //     }
  //     const validation=await this.booktitleRepository.query(
  //       `SELECT * FROM visit_log WHERE student_uuid = $1 AND action = 'entry' ORDER BY timestamp DESC LIMIT 1`,
  //       [student_uuid]    )
  //     // console.log(`validation${ validation }`);
  //     // console.log("Validation result:", JSON.stringify(validation, null, 2));
  //  if(validation===0) console.log('invalid');
  //     await this.booktitleRepository.query(
  //         `INSERT INTO visit_log(student_uuid, action) VALUES($1, 'exit')`,
  //         [student_uuid]
  //       );
  //       return {
  //         message: "Visit log entry created successfully",
  //         student_uuid: student_uuid,
  //         timestamp: new Date().toISOString(), // Adding timestamp for clarity
  //       };
  //     } catch (error) {
  //       throw new HttpException(
  //         `Error ${ error } setting book in library`,
  //         HttpStatus.INTERNAL_SERVER_ERROR,);
  //     }
  //   }

  async getStudentFee(
    student_id: string,
    isPenalty: boolean,
    isCompleted: boolean,
  ) {
    try {
      if (student_id) {
        const result: { student_uuid: string }[] =
          await this.booktitleRepository.query(
            `SELECT student_uuid FROM students_table WHERE student_id = $1`,
            [student_id],
          );
        if (result.length === 0) {
          throw new HttpException(
            { message: 'Invaid Student ID !!' },
            HttpStatus.ACCEPTED,
          );
        }
        const data = await this.booktitleRepository.query(
          `SELECT s1.* , b1.* , t1.* , f1.* FROM fees_penalties f1 
          LEFT JOIN students_table s1 ON f1.borrower_uuid = s1.student_uuid
          LEFT JOIN book_copies b1 ON f1.copy_uuid = b1.book_copy_uuid
          LEFT JOIN book_titles t1 ON b1.book_title_uuid = t1.book_uuid
          WHERE borrower_uuid=$1 and is_penalised=$2 or is_completed= $3`,
          [result[0].student_uuid, isPenalty, isCompleted],
        );
        if (data.length === 0) {
          throw new HttpException(
            { message: 'No Penalties are There!!' },
            HttpStatus.ACCEPTED,
          );
        }
        return data;
      }
      //00008-Tech University-2025
      else if (isPenalty) {
        const data = await this.bookcopyRepository.query(
          `SELECT * FROM fees_penalties WHERE is_penalised = $1`,
          [isPenalty],
        );
        if (data.length === 0) {
          throw new HttpException(
            { message: 'No Penalties are Found!!' },
            HttpStatus.ACCEPTED,
          );
        }
        return data;
      } else if (isCompleted) {
        const data = await this.bookcopyRepository.query(
          `SELECT * FROM fees_penalties WHERE is_completed = $1`,
          [isCompleted],
        );
        if (data.length === 0) {
          throw new HttpException(
            { message: 'No data are Found!!' },
            HttpStatus.ACCEPTED,
          );
        }
        return data;
      }
    } catch (error) {
      throw error;
    }
  }
  async getFullFeeList({ page, limit }: { page: number; limit: number }) {
    try {
      const offset = (page - 1) * limit;

      const result = await this.booktitleRepository.query(
        `SELECT * FROM  fees_penalties LIMIT $1 OFFSET $2`,
        [limit, offset],
      );
      const total = await this.booktitleRepository.query(
        `SELECT * FROM  fees_penalties LIMIT $1 OFFSET $2`,
        [limit, offset],
      );
      if (result.length === 0) {
        throw new HttpException(
          { message: 'No data found!!' },
          HttpStatus.ACCEPTED,
        );
      }
      return {
        data: result,
        pagination: {
          page,
          limit,
          total: parseInt(total[0].count, 10),
          totalPage: Math.ceil(parseInt(total[0].count, 10) / limit),
        },
      };
      result;
    } catch (error) {
      throw error;
    }
  }
  async getFullFeeListStudent() {
    try {
      const result = await this.booktitleRepository
        .query(`SELECT students_table.student_id, book_copies.book_copy_id, students_table.student_name, students_table.department, book_titles.subject, fees_penalties.return_date, fees_penalties.created_at, fees_penalties.penalty_amount FROM  fees_penalties
         INNER JOIN students_table ON fees_penalties.borrower_uuid = students_table.student_uuid 
        INNER JOIN  book_copies ON fees_penalties.book_copy_uuid = book_copies.book_copy_uuid
        INNER JOIN book_titles ON book_titles.book_uuid = book_copies.book_title_uuid`);
      if (result.length === 0) {
        throw new HttpException(
          { message: 'No data found!!' },
          HttpStatus.ACCEPTED,
        );
      }
      return result;
    } catch (error) {
      throw error;
    }
  }
  async generateFeeReport(start: Date, end: Date, page: number, limit: number) {
    try {
      const offset = (page - 1) * limit;

      const result = await this.booktitleRepository.query(
        `SELECT * FROM fees_penalties WHERE updated_at BETWEEN $1 AND $2 LIMIT $3 OFFSET $4 ; `,
        [start, end, limit, offset],
      );
      const total = await this.booktitleRepository.query(
        `SELECT count(*) FROM fees_penalties WHERE updated_at BETWEEN $1 AND $2; `,
        [start, end],
      );
      if (result.length === 0) {
        throw new HttpException(
          { message: 'No data found!!' },
          HttpStatus.ACCEPTED,
        );
      }

      return {
        data: result,
        pagination: {
          total: parseInt(total[0].count, 10),
          page,
          limit,
          totalPages: Math.ceil(parseInt(total[0].count, 10) / limit),
        },
      };
      //  console.log(result);
    } catch (error) {
      throw error;
    }
  }

  async payStudentFee(updateFeesPayload: TUpdateFeesPenaltiesZod) {
    try {
      const studentAndBookCopiesPayloadWithFeesPenalties: {
        student_uuid: string;
        book_copy_uuid: string;
        penalty_amount: number;
        return_date: Date;
        returned_at: Date;
        paid_amount: number;
        is_penalised: boolean;
        is_completed: boolean;
      }[] = await this.studentRepository.query(
        `
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
        [updateFeesPayload.student_id, updateFeesPayload.copy_id], //updateFeesPayload.student_id, updateFeesPayload.book_copy_id
      );

      if (!studentAndBookCopiesPayloadWithFeesPenalties.length) {
        throw new HttpException(
          'Cannot find Student or Book, maybe archived or No penalty or Not returned',
          HttpStatus.BAD_REQUEST,
        );
      }

      //Values when penalty
      let isPenalised =
        studentAndBookCopiesPayloadWithFeesPenalties[0].is_penalised; //True
      let isCompleted =
        studentAndBookCopiesPayloadWithFeesPenalties[0].is_completed; //False

      //current paid amount + new paid amount
      let accumulatedPaidAmount =
        updateFeesPayload.paid_amount +
        studentAndBookCopiesPayloadWithFeesPenalties[0].paid_amount;

      //if student pays less than penalty amount then subtraction results gt 0;
      if (
        studentAndBookCopiesPayloadWithFeesPenalties[0].penalty_amount -
          accumulatedPaidAmount <=
        0
      ) {
        isPenalised = !isPenalised;
        isCompleted = !isCompleted;
      }

      await this.fpRepository.query(
        `
        UPDATE fees_penalties SET payment_method = $1, paid_amount = $2, is_penalised = $3, is_completed = $4`,
        [
          updateFeesPayload.payment_method,
          accumulatedPaidAmount,
          isPenalised,
          isCompleted,
        ],
      );

      return {
        statusCode: HttpStatus.OK,
        messsage: 'Penalty paid successfully!',
      };
    } catch (error) {
      throw error;
    }
  }

  async getRequestBookLogs({ page, limit }: { page: number; limit: number }) {
    try {
      const offset = (page - 1) * limit;
      const requests = await this.requestBooklogRepository.query(
        `
        SELECT rb.request_type, bc.book_copy_id, bt.book_title, bt.book_author, bt.edition, rb.request_id, rb.request_created_at, rb.student_id, rb.is_completed
        FROM request_book_log rb 
        LEFT JOIN book_copies bc ON bc.book_copy_id = rb.book_copy_id
        LEFT JOIN book_titles bt ON bc.book_title_uuid = bt.book_uuid
        WHERE rb.is_archived = false  LIMIT $1 OFFSET $2`,
        [limit, offset],
      );
      const total = await this.requestBooklogRepository.query(
        `
        SELECT COUNT(*) FROM request_book_log WHERE is_archived = false`,
      );
      return {
        data: requests,
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

  async createRequestBooklogIssue(
    student_id: string,
    requestBookIssuePayload: TRequestBookZodIssue,
    ipAddress: string,
  ): Promise<Data<RequestBook>> {
    try {
      const studentExists: Pick<TStudents, 'student_id'>[] =
        await this.studentRepository.query(
          `SELECT student_id FROM students_table WHERE student_id = $1 AND is_archived = FALSE`,
          [student_id],
        );
      if (!studentExists.length) {
        throw new HttpException('Cannot find Student ID', HttpStatus.NOT_FOUND);
      }

      const bookPayloadFromBookCopies: Pick<TBookCopy, 'book_copy_id'>[] =
        await this.bookcopyRepository.query(
          `SELECT book_copy_id FROM book_copies WHERE barcode = $1 AND is_available = true AND is_archived = false`,
          [requestBookIssuePayload.barcode],
        );

      if (!bookPayloadFromBookCopies.length) {
        throw new HttpException('Cannot find Book', HttpStatus.NOT_FOUND);
      }

      const requestExists: Pick<TRequestBook, 'request_id'>[] =
        await this.requestBooklogRepository.query(
          `
        SELECT request_id FROM request_book_log WHERE student_id = $1 AND barcode = $2 AND is_archived = false AND is_completed = false`,
          [student_id, requestBookIssuePayload.barcode],
        );

      if (requestExists.length) {
        throw new HttpException(
          'Already been request!',
          HttpStatus.BAD_REQUEST,
        );
      }

      //Unsafe object, Don't use it!
      const insertObject = Object.assign(requestBookIssuePayload, {
        request_id: Date.now(),
        ip_address: ipAddress,
        student_id: student_id,
        book_copy_id: bookPayloadFromBookCopies[0].book_copy_id,
      }) as TRequestBook;

      const queryData = insertQueryHelper(insertObject, []);
      const result: RequestBook[] = await this.requestBooklogRepository.query(
        `
        INSERT INTO request_book_log(${queryData.queryCol}) values(${queryData.queryArg}) RETURNING request_id`,
        queryData.values,
      );
      return {
        data: result[0],
        pagination: null,
      };
    } catch (error) {
      throw error;
    }
  }

  async createRequestBooklogIssueAR(
    requestBookIssueARPayload: TRequestBookZodIssueReIssueAR,
  ) {
    try {
      let isCompleted = false;
      if (requestBookIssueARPayload.status === 'approved') {
        //overwrite reject reason
        requestBookIssueARPayload.reject_reason = undefined;
        const result: Pick<
          TRequestBook,
          'student_id' | 'barcode' | 'book_copy_id' | 'ip_address'
        >[] = await this.requestBooklogRepository.query(
          `
          SELECT * FROM request_book_log WHERE request_id = $1 AND is_archived = FALSE AND is_completed = FALSE`,
          [requestBookIssueARPayload.request_id],
        );

        if (!result.length) {
          throw new HttpException(
            'Cannot find this request',
            HttpStatus.NOT_FOUND,
          );
        }
        await this.bookBorrowed(result[0], result[0].ip_address, 'borrowed');
        isCompleted = true;
      }

      const queryData = updateQueryHelper(requestBookIssueARPayload, [
        'request_id',
      ]);
      const result: [[], 0 | 1] = await this.requestBooklogRepository.query(
        `
        UPDATE request_book_log SET ${queryData.queryCol}, is_completed = ${isCompleted} 
        WHERE request_id = '${requestBookIssueARPayload.request_id}' AND is_archived = FALSE AND is_completed = FALSE`,
        queryData.values,
      );
      const updatedStatus = result[1];
      if (!updatedStatus) {
        throw new HttpException(
          'Failed to update request',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'Request has been updated!',
      };
    } catch (error) {
      throw error;
    }
  }

  async createReturnBooklogIssue(
    student_id: string,
    returnBookIssuePayload: TReturnBookZodReIssue,
    ipAddress: string,
  ): Promise<Data<RequestBook>> {
    try {
      const studentExists: Pick<TStudents, 'student_id'>[] =
        await this.studentRepository.query(
          `SELECT student_id FROM students_table WHERE student_id = $1 AND is_archived = FALSE`,
          [student_id],
        );
      if (!studentExists.length) {
        throw new HttpException('Cannot find Student ID', HttpStatus.NOT_FOUND);
      }

      const bookPayloadFromBookCopies: Pick<TBookCopy, 'book_copy_id'>[] =
        await this.bookcopyRepository.query(
          `SELECT book_copy_id FROM book_copies WHERE barcode = $1 AND is_available = false AND is_archived = false`,
          [returnBookIssuePayload.barcode],
        );

      if (!bookPayloadFromBookCopies.length) {
        throw new HttpException('Cannot find Book', HttpStatus.NOT_FOUND);
      }

      const requestExists: Pick<TRequestBook, 'request_id'>[] =
        await this.requestBooklogRepository.query(
          `
        SELECT request_id FROM request_book_log WHERE student_id = $1 AND barcode = $2 AND is_archived = false AND is_completed = false`,
          [student_id, returnBookIssuePayload.barcode],
        );

      if (requestExists.length) {
        throw new HttpException(
          'Already been request!',
          HttpStatus.BAD_REQUEST,
        );
      }

      //Unsafe object, Don't use it!
      const insertObject = Object.assign(returnBookIssuePayload, {
        request_id: Date.now(),
        ip_address: ipAddress,
        student_id: student_id,
        book_copy_id: bookPayloadFromBookCopies[0].book_copy_id,
      }) as TRequestBook;

      const queryData = insertQueryHelper(insertObject, []);
      const result: RequestBook[] = await this.requestBooklogRepository.query(
        `
        INSERT INTO request_book_log(${queryData.queryCol}) values(${queryData.queryArg}) RETURNING request_id`,
        queryData.values,
      );
      return {
        data: result[0],
        pagination: null,
      };
    } catch (error) {
      throw error;
    }
  }

  async createReturnBooklogIssueAR(
    requestBookIssueARPayload: TRequestBookZodIssueReIssueAR,
  ) {
    try {
      let isCompleted = false;
      if (requestBookIssueARPayload.status === 'approved') {
        //overwrite reject reason
        requestBookIssueARPayload.reject_reason = undefined;
        const result: Pick<
          TRequestBook,
          'student_id' | 'barcode' | 'book_copy_id' | 'ip_address'
        >[] = await this.requestBooklogRepository.query(
          `
          SELECT * FROM request_book_log WHERE request_id = $1 AND is_archived = FALSE AND is_completed = FALSE`,
          [requestBookIssueARPayload.request_id],
        );

        if (!result.length) {
          throw new HttpException(
            'Cannot find this request',
            HttpStatus.NOT_FOUND,
          );
        }
        await this.bookReturned(result[0], result[0].ip_address, 'returned');
        isCompleted = true;
      }

      const queryData = updateQueryHelper(requestBookIssueARPayload, [
        'request_id',
      ]);
      const result: [[], 0 | 1] = await this.requestBooklogRepository.query(
        `
        UPDATE request_book_log SET ${queryData.queryCol}, is_completed = ${isCompleted} 
        WHERE request_id = '${requestBookIssueARPayload.request_id}' AND is_archived = FALSE AND is_completed = FALSE`,
        queryData.values,
      );
      const updatedStatus = result[1];
      if (!updatedStatus) {
        throw new HttpException(
          'Failed to update request',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'Request has been updated!',
      };
    } catch (error) {
      throw error;
    }
  }

  async createBooklogReissue(
    requestBookReIssuePayload: TRequestBookZodReIssue,
    ip_address: string,
  ) {
    try {
      const student: { student_id: string; student_uuid: string }[] =
        await this.booktitleRepository.query(
          `SELECT student_uuid, student_id FROM students_table WHERE student_id= $1`,
          [requestBookReIssuePayload.student_id],
        );
      if (!student.length) {
        throw new HttpException(
          ' Invalid StudentId !!',
          HttpStatus.BAD_REQUEST,
        );
      }
      const barcode: { book_copy_id: string; book_copy_uuid: string }[] =
        await this.booktitleRepository.query(
          `SELECT book_copy_id, book_copy_uuid FROM book_copies WHERE barcode= $1 AND is_archived=false AND is_available=false`,
          [requestBookReIssuePayload.barcode],
        );
      if (!barcode.length) {
        throw new HttpException(' Invalid barcode !!', HttpStatus.BAD_REQUEST);
      }
      console.log(barcode[0].book_copy_uuid);
      const log = await this.booktitleRepository.query(
        `SELECT * FROM book_logv2 WHERE book_copy_uuid= $1 AND action='borrowed' AND borrower_uuid= $2`,
        [barcode[0].book_copy_uuid, student[0].student_uuid],
      );
      if (!log.length) {
        throw new HttpException(
          ' The book has not been borrowed!!',
          HttpStatus.BAD_REQUEST,
        );
      }
      const validDate = await this.booktitleRepository.query(
        `SELECT * FROM fees_penalties WHERE NOW() <= return_date`,
      );
      if (!validDate.length) {
        throw new HttpException(
          ' The Student is not valid for Renewing this book !!',
          HttpStatus.BAD_REQUEST,
        );
      }

      const insertObject = Object.assign({}, requestBookReIssuePayload, {
        request_id: Date.now(),
        book_copy_id: barcode[0].book_copy_id,
        ip_address: ip_address,
        request_type: requestBookReIssuePayload.request_type,
        extended_period: requestBookReIssuePayload.extended_period,
        student_id: requestBookReIssuePayload.student_id,
      });

      const result = await this.booktitleRepository.query(
        `SELECT request_id FROM request_book_log WHERE student_id = $1 AND barcode = $2 AND is_archived = FALSE AND is_completed = FALSE`,
        [
          requestBookReIssuePayload.student_id,
          requestBookReIssuePayload.barcode,
        ],
      );
      if (result.length) {
        throw new HttpException(
          'Already been request!',
          HttpStatus.BAD_REQUEST,
        );
      }
      const queryData = insertQueryHelper(insertObject, []);

      const insert = await this.booklogRepository.query(
        `INSERT INTO request_book_log(${queryData.queryCol}) VALUES (${queryData.queryArg}) RETURNING request_id`,
        queryData.values,
      );

      throw new HttpException(
        'Student inserted sucessfully ',
        HttpStatus.ACCEPTED,
      );
    } catch (error) {
      throw error;
    }
  }
  async requestBooklogReissuear(
    requestBookIssueARPayload: TRequestBookZodIssueReIssueAR,
  ) {
    try {
      const result: {
        book_copy_id: string;
        student_id: string;
        extended_period;
      }[] = await this.booktitleRepository.query(
        `SELECT book_copy_id, student_id, extended_period FROM request_book_log WHERE request_id= $1`,
        [requestBookIssueARPayload.request_id],
      );
      if (!result.length) {
        throw new HttpException('Request not Found !!', HttpStatus.BAD_REQUEST);
      }
      console.log('part 1');
      //  const book:{book_copy_uuid:string}[]=await this.booktitleRepository.query(`SELECT book_copy_uuid FROM  book_copies WHERE book_copy_id= $1`,[result[0].book_copy_id])
      //  const student:{student_uuid:string}[]= await this.booktitleRepository.query(`SELECT student_uuid FROM students_table WHERE student_id= $1`,[result[0].student_id])
      //  const borrow= await this.booktitleRepository.query(`SELECT * FROM book_logv2 WHERE book_copy_uuid= $1  AND borrower_uuid= $2`,[book[0].book_copy_uuid, student[0].student_uuid]);
      if (requestBookIssueARPayload.status === 'approved') {
        console.log('approved part in work');
        const isCompleted = true;
        const update = await this.booktitleRepository.query(
          `UPDATE request_book_log set status= $1 ,is_completed= $2 ,reject_reason= $3 WHERE request_id= $4`,
          [
            requestBookIssueARPayload.status,
            isCompleted,
            requestBookIssueARPayload.reject_reason,
            requestBookIssueARPayload.request_id,
          ],
        );
        console.log('update log part ');

        const student: { student_uuid: string }[] =
          await this.booktitleRepository.query(
            `SELECT student_uuid FROM students_table WHERE student_id= $1`,
            [result[0].student_id],
          );
        // date is not getting updated
        const date: { return_date: string }[] =
          await this.booktitleRepository.query(
            `SELECT return_date FROM fees_penalties WHERE borrower_uuid= $1`,
            [student[0].student_uuid],
          );

        let returnDate = new Date(date[0].return_date); // Convert to Date object

        if (!isNaN(returnDate.getTime())) {
          // Check if the date is valid
          let daysToAdd = Number(result[0].extended_period); // Ensure it's a number

          returnDate.setDate(returnDate.getDate() + daysToAdd); // Add days

          const final_date = returnDate.toISOString(); // Convert to ISO format
          console.log('final_date:', final_date, 'returnDate:', returnDate);

          const penalupdate = await this.booktitleRepository.query(
            `UPDATE fees_penalties 
        SET return_date=  $1 
        WHERE borrower_uuid = $2  `,
            [final_date, student[0].student_uuid],
          );
          console.log('update penal part ');
        } else {
          console.error('Invalid date format:', date[0].return_date);
        }

        throw new HttpException(
          'Status updated Sucessfully!!',
          HttpStatus.ACCEPTED,
        );
      } else if (requestBookIssueARPayload.status === 'rejected') {
        const isCompleted = false;
        const update = await this.booktitleRepository.query(
          `UPDATE request_book_log set status= $1 ,is_archived=true,is_completed= $2 ,reject_reason= $3 WHERE request_id= $4 AND status='pending' `,
          [
            requestBookIssueARPayload.status,
            isCompleted,
            requestBookIssueARPayload.reject_reason,
            requestBookIssueARPayload.request_id,
          ],
        );
        throw new HttpException(
          'Status updated Sucessfully!!',
          HttpStatus.ACCEPTED,
        );
      }
      throw new HttpException('Invalid Status !!', HttpStatus.BAD_REQUEST);
    } catch (error) {
      throw error;
    }
  }

  async studentCurrentBooks(student_id: string) {
    try {
      const result: { student_uuid: string }[] =
        await this.booktitleRepository.query(
          `SELECT student_uuid  FROM students_table WHERE student_id= $1`,
          [student_id],
        );
      if (!result.length) {
        throw new HttpException(
          ' Invalid StudentId!! ',
          HttpStatus.BAD_REQUEST,
        );
      }
      const booklog: { book_title_uuid: string }[] =
        await this.booktitleRepository.query(
          `SELECT book_title_uuid FROM book_logv2 WHERE borrower_uuid = $1 AND status = 'borrowed' ORDER BY borrowed DESC ;`,
          [result[0].student_uuid],
        );
      const data = await this.booktitleRepository.query(
        `SELECT * FROM  book_titles INNER JOIN book_copies ON book_titles.book_uuid=book_copies.book_title_uuid WHERE book_copies.book_title_uuid= $1 limit 1`,
        [booklog[0].book_title_uuid],
      );
      return data;
    } catch (error) {
      throw error;
    }
  }
}
