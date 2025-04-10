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
// @ts-ignore
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
import { Review } from 'src/reviews/entities/review.entity';
import { TRequestDTO } from './dto/book-request.dto';
import { TRequestActionDTO } from './dto/book-req-action.dto';
import { stat } from 'fs';

export interface Data<T> {
  data: T;
  meta?: any;
  pagination: null;
}

export interface DataWithPagination<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
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

  async getBooks({
    page,
    limit,
    search,
    asc,
    dec,
    filter,
    instituteUuid,
  }: {
    page: number;
    limit: number;
    asc: string[];
    dec: string[];
    filter: { field: string; value: (string | number)[]; operator: string }[];
    search: { field: string; value: string }[];
    instituteUuid: string[];
  }): Promise<DataWithPagination<BookTitle>> {
    try {
      const offset = (page - 1) * limit;
      const queryBuilder =
        this.booktitleRepository.createQueryBuilder('book_titles');
      queryBuilder.andWhere('book_titles.isArchived = false');

      if (instituteUuid && instituteUuid.length > 0) {
        queryBuilder.andWhere(
          'book_titles.instituteUuid IN (:...instituteUuid)',
          {
            instituteUuid,
          },
        );
      }

      filter.forEach((filterItem) => {
        const { field, value, operator } = filterItem;
        if (operator === 'IN') {
          queryBuilder.andWhere(`book_titles.${field} IN (:...${field})`, {
            [field]: value,
          });
        } else {
          queryBuilder.andWhere(`book_titles.${field} ${operator} :${field}`, {
            [field]: value,
          });
        }
      });

      search.forEach((searchItem) => {
        const { field, value } = searchItem;
        queryBuilder.andWhere(`book_titles.${field} ILIKE :${field}`, {
          [field]: `%${value}%`,
        });
      });

      if (asc.length > 0) {
        asc.forEach((column) => {
          queryBuilder.addOrderBy(`book_titles.${column}`, 'ASC');
        });
      }

      if (dec.length > 0) {
        dec.forEach((column) => {
          queryBuilder.addOrderBy(`book_titles.${column}`, 'DESC');
        });
      }

      const total = await queryBuilder.getCount();

      const books = await queryBuilder.skip(offset).take(limit).getMany();

      return {
        data: books,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
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
    bookUuid,
    isbn,
    titlename,
  }: {
    bookUuid: string;
    isbn: string;
    titlename: string;
  }): Promise<
    Data<
      {
        reviews: Review[];
      } & BookTitle
    >
  > {
    try {
      const queryBuilder = this.booktitleRepository.createQueryBuilder('book');

      if (bookUuid) {
        queryBuilder.andWhere('book.bookUuid = :bookUuid', { bookUuid });
      }

      if (isbn) {
        queryBuilder.andWhere('book.isbn = :isbn', { isbn });
      }

      if (titlename) {
        queryBuilder.andWhere('book.bookTitle ILIKE :titlename', {
          titlename: `%${titlename}%`,
        });
      }

      const book = await queryBuilder.getOne();

      if (!book) {
        throw new HttpException('Book not found', HttpStatus.NOT_FOUND);
      }

      const reviews = await this.booktitleRepository.query(
        `
        SELECT 
          re.starRating, 
          re.reviewText, 
          re.createdAt, 
          st.firstName, 
          st.barCode 
        FROM reviews re 
        LEFT JOIN students_info st ON re.studentUuid = st.studentUuid 
        WHERE re.bookUuid = $1 AND re.isApproved = true`,
        [book.bookUuid],
      );

      return { data: { ...book[0], reviews }, pagination: null };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Error fetching book details',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
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
  }): Promise<DataWithPagination<Booklog_v2>> {
    try {
      const offset = (page - 1) * limit;

      const queryBuilder = this.booklogRepository
        .createQueryBuilder('log')
        .select([
          'log.bookCopyUuid AS bookCopyUuid',
          'log.newBookTitle AS newBookTitle',
          'log.newBookCopy AS newBookCopy',
          'log.action AS action',
          'log.createdAt AS createdAt',
          'title.bookUuid AS bookUuid',
          'title.bookTitle AS bookTitle',
          'title.authorType1 AS authorType1',
          'title.isbn AS isbn',
          'title.department AS department',
          'title.authorType1 AS authorType1',
          'title.availableCount AS availableCount',
          'title.totalCount AS totalCount',
        ])
        .innerJoin('book_titles', 'title', 'title.bookUuid = log.bookUuuid');

      if (book_title_id) {
        queryBuilder.andWhere('title.bookTitleId = :bookTitleId', {
          book_title_id,
        });
      }

      if (isbn) {
        queryBuilder.andWhere('title.isbn = :isbn', { isbn });
      }

      const total = await queryBuilder.getCount();
      const { entities: logs, raw } = await queryBuilder
        .limit(limit)
        .offset(offset)
        .getRawAndEntities();

      return {
        data: logs,
        agination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async getBookCopiesByTitle({
    bookUuid,
    isbn,
    titlename,
    page,
    limit,
    search,
    asc,
    dec,
    filter,
  }: {
    bookUuid: string;
    isbn: string;
    titlename: string;
    page: number;
    limit: number;
    asc: string[];
    dec: string[];
    filter: { field: string; value: (string | number)[]; operator: string }[];
    search: { field: string; value: string }[];
  }): Promise<DataWithPagination<BookCopy>> {
    try {
      const offset = (page - 1) * limit;

      const titleQuery = this.booktitleRepository
        .createQueryBuilder('book_titles')
        .select(['book_titles.bookUuid', 'book_titles.bookTitleId']);

      if (bookUuid) {
        titleQuery.andWhere('book_titles.bookUuid = :bookUuid', { bookUuid });
      }
      if (isbn) {
        titleQuery.andWhere('book_titles.isbn = :isbn', { isbn });
      }
      if (titlename) {
        titleQuery.andWhere('book_titles.bookTitle ILIKE :titlename', {
          titlename: `${titlename}%`,
        });
      }

      const book = await titleQuery.getOne();

      if (!book) {
        throw new HttpException('Book not found', HttpStatus.NOT_FOUND);
      }

      filter.push({
        field: 'book_copies.isArchived',
        value: ['false'],
        operator: '=',
      });
      filter.push({
        field: 'book_copies.bookTitleUuidRel',
        value: [book.bookUuid],
        operator: '=',
      });

      dec.push('book_copies.createdAt');

      const queryBuilder = this.bookcopyRepository
        .createQueryBuilder('book_copies')
        .innerJoinAndSelect('book_copies.bookTitleUuidRel', 'book_titles');

      filter.forEach(({ field, value, operator }) => {
        const paramKey = field.replace('.', '_'); // ensure unique param names
        if (operator === 'IN') {
          queryBuilder.andWhere(`${field} IN (:...${paramKey})`, {
            [paramKey]: value,
          });
        } else {
          queryBuilder.andWhere(`${field} ${operator} :${paramKey}`, {
            [paramKey]: value[0], // assume one value for non-IN
          });
        }
      });

      search.forEach(({ field, value }) => {
        const paramKey = field.replace('.', '_') + '_search';
        queryBuilder.andWhere(`${field} ILIKE :${paramKey}`, {
          [paramKey]: `%${value}%`,
        });
      });

      // Apply sorting
      asc.forEach((col) => queryBuilder.addOrderBy(col, 'ASC'));
      dec.forEach((col) => queryBuilder.addOrderBy(col, 'DESC'));

      const total = await queryBuilder.getCount();

      // Paginate
      const books = await queryBuilder.skip(offset).take(limit).getMany();

      if (books.length === 0) {
        throw new HttpException('Book not found', HttpStatus.NOT_FOUND);
      }
      return {
        data: books,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new HttpException(
        'Error fetching books',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getSingleCopyInfo(identifier: string): Promise<Data<BookCopy>> {
    try {
      const queryBuilder = this.bookcopyRepository.createQueryBuilder('copy');

      queryBuilder.where('copy.isArchived = false');

      queryBuilder.andWhere('copy.barcode = :id', { id: Number(identifier) });

      const data = await queryBuilder.getOne();

      if (!data) {
        throw new HttpException('Book not found', HttpStatus.NOT_FOUND);
      }

      return { data, pagination: null };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
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
  }): Promise<DataWithPagination<Booklog_v2>> {
    try {
      const offset = (page - 1) * limit;

      const book = await this.bookcopyRepository
        .createQueryBuilder('copy')
        .select('copy.bookCopyUuid')
        .where('copy.barcode = :barcode', { barcode })
        .getOne();

      if (!book) {
        throw new HttpException('Book not found', HttpStatus.NOT_FOUND);
      }
      const [logs, total] = await this.booklogRepository
        .createQueryBuilder('log')
        .where('log.bookCopyUuid = :bookCopyUuid', {
          bookCopyUuid: book.bookCopyUuid,
        })
        .orderBy('log.time', 'DESC') // optional: sort by latest
        .skip(offset)
        .take(limit)
        .getManyAndCount();

      return {
        data: logs,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // async getBookJournal(
  //   {
  //     book_journal_page,
  //     book_journal_limit,
  //     book_journal_search,
  //   }: {
  //     book_journal_page: number;
  //     book_journal_limit: number;
  //     book_journal_search: string;
  //   } = {
  //     book_journal_page: 1,
  //     book_journal_limit: 10,
  //     book_journal_search: '',
  //   },
  //   {
  //     note_page,
  //     note_limit,
  //     note_search,
  //   }: { note_page: number; note_limit: number; note_search: string } = {
  //     note_page: 1,
  //     note_limit: 10,
  //     note_search: '',
  //   },
  // ) {
  //   try {
  //     const book_journal_searchQuery = book_journal_search
  //       ? `${book_journal_search}%`
  //       : '%';
  //     const book_journal_pageQuery =
  //       (book_journal_page - 1) * book_journal_limit;
  //     const book_journal_limitQuery = book_journal_limit;

  //     const books: any[] = await this.booktitleRepository.query(
  //       `SELECT book_title_id AS id, book_title AS title, book_author AS author, name_of_publisher AS publisher, available_count AS count, isbn AS isbn_issn, year_of_publication
  //       FROM book_titles WHERE book_title ILIKE $1 AND is_archived = false AND available_count > 0 AND total_count > 0 LIMIT $2 OFFSET $3`,
  //       [
  //         book_journal_searchQuery,
  //         book_journal_limitQuery,
  //         book_journal_pageQuery,
  //       ],
  //     );
  //     console.log('working');

  //     const notes: any[] = await this.booktitleRepository.query(
  //       `SELECT * FROM notes WHERE is_archived = false AND is_approved = true`,
  //     );

  //     const totalBooks = await this.booktitleRepository.query(
  //       `SELECT COUNT(*) as count FROM book_titles
  //       WHERE is_archived = false AND available_count > 0 AND total_count > 0`,
  //     );
  //     const totalNotes = await this.booktitleRepository.query(
  //       `SELECT COUNT(*) as count FROM notes WHERE is_archived = FALSE AND is_approved = TRUE`,
  //     );
  //     console.log(totalNotes, totalBooks);
  //     return {
  //       book_journal: books,
  //       book_journal_pagination: {
  //         total: parseInt(totalBooks[0].count, 10),
  //         book_journal_page,
  //         book_journal_limit,
  //         totalPages: Math.ceil(
  //           parseInt(totalBooks[0].count, 10) / book_journal_limit,
  //         ),
  //       },
  //     };
  //   } catch (error) {
  //     throw error;
  //   }
  // }

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

  async createRequestBooklogIssue(
    studentUuid: string,
    requestBookIssuePayload: TRequestDTO,
    ipAddress: string,
  ): Promise<Data<RequestBook>> {
    try {
      const queryBuilder = this.bookcopyRepository
        .createQueryBuilder('book_copies')
        .leftJoin(
          'book_titles',
          'book_titles',
          'book_titles.bookUuid = book_copies.bookTitleUuidRel',
        )
        .addSelect(['book_titles.book_title'])
        .where('book_copies.barcode = :barcode', {
          barcode: requestBookIssuePayload.barcode,
        })
        .andWhere('book_copies.is_archived = false');

      if (
        requestBookIssuePayload.requestType === 'return' ||
        requestBookIssuePayload.requestType === 'reissue'
      ) {
        queryBuilder.andWhere('book_copies.isAvailable = false');
      } else {
        queryBuilder.andWhere('book_copies.isAvailable = true');
      }

      const bookCopy = await queryBuilder.getRawOne();

      if (!bookCopy) {
        throw new HttpException('Cannot find Book', HttpStatus.NOT_FOUND);
      }

      const existingRequest = await this.requestBooklogRepository.findOne({
        where: {
          studentUuid,
          barcode: requestBookIssuePayload.barcode,
          isArchived: false,
          isCompleted: false,
        },
        select: ['requestId'],
      });

      if (existingRequest) {
        throw new HttpException(
          'Already been request!',
          HttpStatus.BAD_REQUEST,
        );
      }

      const newRequest = this.requestBooklogRepository.create({
        ...requestBookIssuePayload,
        ipAddress,
        studentUuid,
      });

      const data = await this.requestBooklogRepository.save(newRequest);

      return {
        data,
        pagination: null,
      };
    } catch (error) {
      throw error;
    }
  }

  async requestBookAction({
    requestId,
    reason,
    status,
  }: TRequestActionDTO): Promise<Data<{ statusCode: any; message: string }>> {
    try {
      const existingRequest = await this.requestBooklogRepository.findOne({
        where: {
          requestId,
          isArchived: false,
          isCompleted: false,
        },
      });
      if (!existingRequest) {
        throw new HttpException('Request not found', HttpStatus.NOT_FOUND);
      }
      switch (existingRequest.requestType) {
        case 'return':
          if (status === 'approved') {
            await this.bookReturned(
              {
                student_id: existingRequest.studentUuid,
                barcode: existingRequest.barcode,
              },
              existingRequest.ipAddress,
              'returned',
            );
          }
          break;
        case 'reissue':
          if (status === 'approved') {
            await this.bookBorrowed(
              {
                student_id: existingRequest.studentUuid,
                barcode: existingRequest.barcode,
              },
              existingRequest.ipAddress,
              'borrowed',
            );
          }
          break;
        case 'request':
          if (status === 'approved') {
            await this.bookBorrowed(
              {
                student_id: existingRequest.studentUuid,
                barcode: existingRequest.barcode,
              },
              existingRequest.ipAddress,
              'borrowed',
            );
          }
          break;
      }
      existingRequest.isArchived = status === 'approved';
      existingRequest.isCompleted = status === 'approved';
      existingRequest.reason = reason || '';
      await this.requestBooklogRepository.save(existingRequest);
      return {
        data: {
          statusCode: HttpStatus.OK,
          message: `Request has been ${status}!`,
        },
        pagination: null,
      };
    } catch (error) {
      throw error;
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

  async getLogDetailsOfStudent({
    studentUuid,
    page,
    limit,
  }: {
    studentUuid: string;
    page: number;
    limit: number;
  }): Promise<DataWithPagination<Booklog_v2>> {
    try {
      const offset = (page - 1) * limit;

      const [data, total] = await this.booklogRepository
        .createQueryBuilder('log')
        .where('log.borrowerUuid = :studentUuid', { studentUuid })
        .orderBy('log.time', 'DESC')
        .skip(offset)
        .take(limit)
        .getManyAndCount();

      return {
        data,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
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
        WHERE fp.is_completed = false AND fp.borrower_uuid = $1 ORDER BY fp.created_at DESC  LIMIT $2 OFFSET $3
        `,
        //         ` SELECT  book_copies.book_copy_id, book_titles.book_title, fees_penalties.created_at, fees_penalties.returned_at, book_titles.department FROM book_titles INNER JOIN book_copies ON book_titles.book_uuid= book_copies.book_title_uuid
        //           INNER JOIN fees_penalties ON fees_penalties.book_copy_uuid =book_copies.book_copy_uuid
        //          INNER JOIN students_table ON fees_penalties.borrower_uuid = students_table.student_uuid  WHERE student_id=$1
        //  LIMIT $2 OFFSET $3`,
        [student_id, limit, offset],
      );
      const totalCount = await this.booklogRepository.query(
        `SELECT COUNT(*) FROM fees_penalties WHERE is_completed = false AND borrower_uuid = $1`,
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
      let bookTitleUUID: Pick<TBookTitle, 'book_uuid' | 'institute_uuids'>[] =
        await this.booktitleRepository.query(
          `SELECT book_uuid, institute_uuids FROM book_titles WHERE isbn = $1`,
          [createBookpayload.isbn],
        );

      //Book Title Table logic
      if (!bookTitleUUID.length) {
        // (bookTitleUUID[0].institute_uuids as string[])
        //Create the required Columns, Arg, and Values
        //Ignore the Columns that are used by Copy table
        //Here, there is no record of the book already being in existance, hence an array needs to be created for the UUID
        let createBookPayloadForTitle = Object.assign({}, createBookpayload, {
          institute_uuids: [createBookpayload.institute_uuid],
        });
        const bookTitleQueryData = insertQueryHelper(
          createBookPayloadForTitle,
          [
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
          ],
        );

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
        const instituteUUIDs = bookTitleUUID[0].institute_uuids as string[];
        if (!instituteUUIDs.includes(createBookpayload.institute_uuid)) {
          instituteUUIDs.push(createBookpayload.institute_uuid);
        }
        const stringyfiedInstituteUUIDS = JSON.stringify(instituteUUIDs);
        await this.booktitleRepository.query(
          `UPDATE book_titles SET total_count = total_count + 1, available_count = available_count + 1, institute_uuids = $2, updated_at = NOW() WHERE isbn = $1`,
          [createBookpayload.isbn, stringyfiedInstituteUUIDS],
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

  async bookReturned(
    booklogPayload: Omit<TCreateBooklogV2DTO, 'action'>,
    ipAddress: string,
    status: 'returned',
  ) {
    try {
      const studentExists: TStudents[] = await this.studentRepository.query(
        `SELECT * FROM students_table WHERE student_id = $1 AND is_archived = FALSE`,
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

      const data = await this.booklogRepository.query(
        `INSERT INTO book_logv2 (
          borrower_uuid, book_copy_uuid, action, description, book_title_uuid,
          old_book_copy, new_book_copy, old_book_title, new_book_title, ip_address, fp_uuid, institute_uuid, institute_name
        ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
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
          studentExists[0].institute_uuid,
          studentExists[0].institute_name,
        ],
      );

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Book returned successfully',
        meta: data[0],
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
      const studentExists: TStudents[] = await this.studentRepository.query(
        `SELECT * FROM students_table WHERE student_id = $1 AND is_archived = FALSE`,
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

      const data = await this.booklogRepository.query(
        `INSERT INTO book_logv2 (
          borrower_uuid, book_copy_uuid, action, description, book_title_uuid,
          old_book_copy, new_book_copy, old_book_title, new_book_title, ip_address, fp_uuid, institute_uuid, institute_name
        ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
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
          studentExists[0].institute_uuid,
          studentExists[0].institute_name,
        ],
      );

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Book borrowed successfully',
        meta: data[0],
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

  

  
  async getRequestBookLogs({
    institute_uuid,
    page,
    limit,
    search,
    asc,
    dec,
    filter,
  }: {
    institute_uuid: string[];
    page: number;
    limit: number;
    asc: string[];
    dec: string[];
    filter: { field: string; value: (string | number)[]; operator: string }[];
    search: { field: string; value: string }[];
  }) {
    try {
      const offset = (page - 1) * limit;

      const params: (string | number)[] = [];

      filter.push({
        field: 'cr.institute_uuid',
        value: institute_uuid,
        operator: '=',
      });
      filter.push({ field: 'cr.is_archived', value: ['false'], operator: '=' });
      filter.push({
        field: 'cr.is_completed',
        value: ['false'],
        operator: '=',
      });

      // console.log(await this.requestBooklogRepository.query(`
      //   SELECT * FROM notes
      //   `))

      console.log({ institute_uuid });

      const whereClauses = this.queryBuilderService.buildWhereClauses(
        filter,
        search,
        params,
      );
      console.log(asc, dec);
      const orderByQuery = this.queryBuilderService.buildOrderByClauses(
        asc,
        dec.length > 0 ? dec : ['cr.created_at'],
      );

      const requests = await this.requestBooklogRepository.query(
        `
        SELECT * FROM (
          SELECT 
            rb.request_type AS request_type, 
            bc.book_copy_id AS book_copy_id, 
            bt.book_title AS book_title, 
            bt.book_author AS book_author, 
            bt.edition AS edition, 
            rb.request_id AS request_id,  
            rb.request_created_at AS created_at, 
            rb.student_id AS student_id, 
            rb.is_completed AS is_completed, 
            rb.institute_uuid AS institute_uuid, 
            rb.is_archived AS is_archived
          FROM request_book_log rb 
          LEFT JOIN book_copies bc ON bc.book_copy_id = rb.book_copy_id
          LEFT JOIN book_titles bt ON bc.book_title_uuid = bt.book_uuid

          UNION ALL

          SELECT 
            'notes' as request_type,                     
            n.note_resource as book_copy_id,    
            n.note_title as book_title,                  
            n.author  as book_author, 
            NULL as edition,                     
            n.notes_uuid::text as request_id,                  
            n.created_at as created_at,  
            st.student_id as student_id,                
            n.is_approved as is_completed,
            n.institute_uuid AS institute_uuid, 
            n.is_archived AS is_archived            
          FROM notes n 
          LEFT JOIN students_table st ON st.student_uuid = n.student_uuid
        ) as cr
        ${whereClauses} ${orderByQuery} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, limit, offset],
      );
      // console.log({ requests });
      // console.log({ whereClauses });
      const total = await this.requestBooklogRepository.query(
        `
        SELECT COUNT(*) FROM (
          SELECT 
            rb.request_type AS request_type, 
            bc.book_copy_id AS book_copy_id, 
            bt.book_title AS book_title, 
            bt.book_author AS book_author, 
            bt.edition AS edition, 
            rb.request_id AS request_id,  
            rb.request_created_at AS created_at, 
            rb.student_id AS student_id, 
            rb.is_completed AS is_completed, 
            rb.institute_uuid AS institute_uuid, 
            rb.is_archived AS is_archived
          FROM request_book_log rb 
          LEFT JOIN book_copies bc ON bc.book_copy_id = rb.book_copy_id
          LEFT JOIN book_titles bt ON bc.book_title_uuid = bt.book_uuid

          UNION ALL

          SELECT 
            'notes' as request_type,                     
            n.note_resource as book_copy_id,    
            n.note_title as book_title,                  
            n.author  as book_author, 
            NULL as edition,                     
            n.notes_uuid::text as request_id,                  
            n.created_at as created_at,  
            st.student_id as student_id,                
            n.is_approved as is_completed,
            n.institute_uuid AS institute_uuid, 
            n.is_archived AS is_archived            
          FROM notes n 
          LEFT JOIN students_table st ON st.student_uuid = n.student_uuid
        ) as cr
          ${whereClauses}`,
        params,
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
