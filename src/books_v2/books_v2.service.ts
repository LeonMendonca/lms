import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookCopy } from './entity/books_v2.copies.entity';
import { BookTitle } from './entity/books_v2.title.entity';
import { TCreateBookZodDTO } from './zod/createbookdtozod';
import { Booklog_v2 } from './entity/book_logv2.entity';
import { TbookUUIDZod } from './zod/bookuuid-zod';
import { Chunkify } from 'src/worker-threads/chunk-array';
import { CreateWorker } from 'src/worker-threads/worker-main-thread';
import { RequestBook } from './entity/request-book.entity';
import { TUpdateResult } from 'src/worker-threads/student/student-archive-worker';
import { TInsertResult } from 'src/worker-threads/worker-types/book-insert.type';
import { QueryBuilderService } from 'src/query-builder/query-builder.service';
import { Review } from 'src/reviews/entities/review.entity';
import { TRequestDTO } from './dto/book-request.dto';
import { TRequestActionDTO } from './dto/book-req-action.dto';
import { TCreateBookDTO } from './dto/book-create.dto';
import { TCreateBooklogActionDTO } from './dto/booklog-create.dto';
import { StudentsData } from 'src/students/entities/student.entity';
import { LibraryConfig } from 'src/config/entity/library_config.entity';

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

    @InjectRepository(StudentsData)
    private readonly studentDataRepository: Repository<StudentsData>,

    @InjectRepository(Booklog_v2)
    private readonly booklogRepository: Repository<Booklog_v2>,

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

      if (instituteUuid && instituteUuid.length > 0) {
        queryBuilder.andWhere(
          'book_titles."instituteUuid" IN (:...instituteUuid)',
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
        queryBuilder.andWhere('book."bookUuid" = :bookUuid', { bookUuid });
      }

      if (isbn) {
        queryBuilder.andWhere('book.isbn = :isbn', { isbn });
      }

      if (titlename) {
        queryBuilder.andWhere('book."bookTitle" ILIKE :titlename', {
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
          re."starRating", 
          re."reviewText", 
          re."createdAt", 
          st."firstName", 
          st."barCode" 
        FROM reviews re 
        LEFT JOIN students_info st ON re."studentUuid" = st."studentUuid" 
        WHERE re."bookUuid" = $1 AND re."isApproved" = true`,
        [book.bookUuid],
      );

      return { data: { ...book, reviews }, pagination: null };
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

      const titleQuery = this.booktitleRepository.createQueryBuilder('book');

      if (bookUuid) {
        titleQuery.andWhere('book."bookUuid" = :bookUuid', { bookUuid });
      }
      if (isbn) {
        titleQuery.andWhere('book.isbn = :isbn', { isbn });
        console.log('hert');
      }
      if (titlename) {
        titleQuery.andWhere('book."bookTitle" ILIKE :titlename', {
          titlename: `${titlename}%`,
        });
      }

      const book = await titleQuery.getOne();

      if (!book) {
        throw new HttpException('Book not found', HttpStatus.NOT_FOUND);
      }

      filter.push({
        field: 'book_copies."isArchived"',
        value: ['false'],
        operator: '=',
      });
      filter.push({
        field: 'book_copies."bookTitleUuidRel"',
        value: [book.bookUuid],
        operator: '=',
      });

      dec.push('book_copies."createdAt"');

      const queryBuilder = this.bookcopyRepository
        .createQueryBuilder('book_copies')
        .leftJoin(
          'book_titles',
          'bt',
          'bt."bookUuid" = book_copies."bookTitleUuidRel"',
        )
        .addSelect('book_copies') // selects all columns from book_copies
        .addSelect('bt');

      filter.forEach(({ field, value, operator }) => {
        const paramKey = field
          .replace('.', '_')
          .replace('"', '')
          .replace('"', ''); // ensure unique param names
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
      const books = await queryBuilder.skip(offset).take(limit).getRawMany();

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
      console.log(error);
      throw new HttpException(
        'Error fetching books',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getSingleCopyInfo(identifier: string): Promise<Data<BookCopy>> {
    try {
      const queryBuilder = this.bookcopyRepository.createQueryBuilder('copy');

      queryBuilder.where('copy."isArchived" = false');

      queryBuilder.andWhere('copy.barcode = :id', { id: identifier });

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
          'book_titles."bookUuid" = book_copies."bookTitleUuidRel"',
        )
        .addSelect(['book_titles."bookTitle"'])
        .where('book_copies.barcode = :barcode', {
          barcode: requestBookIssuePayload.barcode,
        })
        .andWhere('book_copies."isArchived" = false');

      if (
        requestBookIssuePayload.requestType === 'return' ||
        requestBookIssuePayload.requestType === 'reissue'
      ) {
        queryBuilder.andWhere('book_copies."isAvailable" = false');
      } else {
        queryBuilder.andWhere('book_copies."isAvailable" = true');
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
        bookCopyId: bookCopy.book_copies_bookCopyUuid,
        ipAddress,
        studentUuid,
        status: 'pending',
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
      const student = await this.studentDataRepository.findOne({
        where: {
          studentUuid: existingRequest.studentUuid
        }
      })
      if (!student) {
        throw new HttpException('Student Barcode not set', HttpStatus.NOT_FOUND);
      }
      switch (existingRequest.requestType) {
        case 'return':
          if (status === 'approved') {
            await this.bookActions(
              {
                barCode: student.barCode,
                barcode: existingRequest.barcode,
                action: 'returned',
              },
              existingRequest.ipAddress,
              'returned',
            );
          }
          break;
        case 'reissue':
          if (status === 'approved') {
            await this.bookActions(
              {
                barCode: student.barCode,
                barcode: existingRequest.barcode,
                action: 'returned',
              },
              existingRequest.ipAddress,
              'returned',
            );
            await this.bookActions(
              {
                barCode: student.barCode,
                barcode: existingRequest.barcode,
                action: 'borrowed',
              },
              existingRequest.ipAddress,
              'borrowed',
            );
          }
          break;
        case 'request':
          if (status === 'approved') {
            await this.bookActions(
              {
                barCode: student.barCode,
                barcode: existingRequest.barcode,
                action: 'borrowed',
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

  async createBook(
    createBookPayload: TCreateBookDTO,
  ): Promise<Data<BookTitle>> {
    try {
      const { isbn, instituteUuid } = createBookPayload;
      let bookTitle = await this.booktitleRepository.findOne({
        where: { isbn },
      });
      if (!bookTitle) {
        const newBookTitle = this.booktitleRepository.create({
          ...createBookPayload,
          instituteUuid: instituteUuid,
          totalCount: 1,
          availableCount: 1,
        });

        bookTitle = await this.booktitleRepository.save(newBookTitle);
      } else {
        bookTitle.totalCount += 1;
        bookTitle.availableCount += 1;

        await this.booktitleRepository.save(bookTitle);
      }

      const newBookCopy = this.bookcopyRepository.create({
        ...createBookPayload,
        bookTitleUuidRel: bookTitle.bookUuid,
      });
      console.log('here');

      await this.bookcopyRepository.save(newBookCopy);
      console.log('here');
      return { data: bookTitle, pagination: null };
    } catch (error) {
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

  async getRequestBookLogs({
    instituteUuid,
    page,
    limit,
    search,
    asc,
    dec,
    filter,
  }: {
    instituteUuid: string[];
    page: number;
    limit: number;
    asc: string[];
    dec: string[];
    filter: { field: string; value: (string | number)[]; operator: string }[];
    search: { field: string; value: string }[];
  }): Promise<DataWithPagination<RequestBook>> {
    try {
      const offset = (page - 1) * limit;

      const params: (string | number)[] = [];

      // filter.push({
      //   field: 'cr.instituteUuid',
      //   value: instituteUuid,
      //   operator: '=',
      // });
      filter.push({
        field: 'cr."isArchived"',
        value: ['false'],
        operator: '=',
      });
      filter.push({
        field: 'cr."isCompleted"',
        value: ['false'],
        operator: '=',
      });

      const whereClauses = this.queryBuilderService.buildWhereClauses(
        filter,
        search,
        params,
      );

      const orderByQuery = this.queryBuilderService.buildOrderByClauses(
        asc,
        dec.length > 0 ? dec : ['cr."createdAt"'],
      );

      const requests = await this.requestBooklogRepository.query(
        `
        SELECT * FROM (
          SELECT 
            rb."requestType" AS "requestType", 
            rb."bookCopyId" AS "bookCopyId", 
            bt."bookTitle" AS "bookTitle", 
            bt.author1 AS author, 
            bt.edition AS edition, 
            rb."requestId" AS "requestId",  
            rb."createdAt" AS "createdAt", 
            rb."studentUuid" AS "studentUuid", 
            rb."isCompleted" AS "isCompleted", 
            rb."instituteUuid"::text AS "instituteUuid", 
            rb."isArchived" AS "isArchived"
          FROM request_book_log rb 
          LEFT JOIN book_copies bc ON bc."bookCopyUuid"::text = rb."bookCopyId"
          LEFT JOIN book_titles bt ON bc."bookTitleUuidRel" = bt."bookUuid"

          UNION ALL

          SELECT 
            'notes' as "requestType",                     
            n."noteResource" as "bookCopyId",    
            n."noteTitle" as "bookTitle",                  
            n.author  as author, 
            NULL as edition,                     
            n."notesUuid" as "requestId",                  
            n."createdAt" as "createdAt",  
            st."studentUuid"::text as "studentUuid",                
            n."isApproved" as "isCompleted",
            n."instituteUuid"::text AS "instituteUuid", 
            n."isArchived" AS "isArchived"            
          FROM notes n 
          LEFT JOIN students_info st ON st."studentUuid" = n."studentUuid"
        ) as cr
        ${whereClauses} ${orderByQuery} LIMIT $${params.length + 1} OFFSET $${params.length + 2}
        `,
        [...params, limit, offset],
      );

      const total = await this.requestBooklogRepository.query(
        `
       SELECT COUNT(*) FROM (
          SELECT 
            rb."requestType" AS "requestType", 
            rb."bookCopyId" AS "bookCopyId", 
            bt."bookTitle" AS "bookTitle", 
            bt.author1 AS author, 
            bt.edition AS edition, 
            rb."requestId" AS "requestId",  
            rb."createdAt" AS "createdAt", 
            rb."studentUuid" AS "studentUuid", 
            rb."isCompleted" AS "isCompleted", 
            rb."instituteUuid"::text AS "instituteUuid", 
            rb."isArchived" AS "isArchived"
          FROM request_book_log rb 
          LEFT JOIN book_copies bc ON bc."bookCopyUuid"::text = rb."bookCopyId"
          LEFT JOIN book_titles bt ON bc."bookTitleUuidRel" = bt."bookUuid"

          UNION ALL

          SELECT 
            'notes' as "requestType",                     
            n."noteResource" as "bookCopyId",    
            n."noteTitle" as "bookTitle",                  
            n.author  as author, 
            NULL as edition,                     
            n."notesUuid" as "requestId",                  
            n."createdAt" as "createdAt",  
            st."studentUuid"::text as "studentUuid",                
            n."isApproved" as "isCompleted",
            n."instituteUuid"::text AS "instituteUuid", 
            n."isArchived" AS "isArchived"            
          FROM notes n 
          LEFT JOIN students_info st ON st."studentUuid" = n."studentUuid"
        ) as cr
        ${whereClauses}
        `,
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

  // Create a new book

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

  async bookActions(
    { barCode, barcode }: TCreateBooklogActionDTO,
    ipAddress: string,
    status: string, // 'borrowed' | 'returned' | 'in_library_borrowed'
  ): Promise<Data<{ message: string }>> {
    try {
      const student = await this.studentDataRepository.findOne({
        where: {
          barCode,
          isArchived: false,
        },
      });

      if (!student) {
        throw new HttpException('Cannot find Student ID', HttpStatus.NOT_FOUND);
      }

      const bookCopy = await this.bookcopyRepository.findOne({
        where: {
          barcode,
          isAvailable: status === 'borrowed',
          isArchived: false,
        },
      });

      const libraryConfig: LibraryConfig[] =
        await this.bookcopyRepository.query(
          `SELECT * FROM library_config WHERE "instituteUuid" = $1`,
          [student.instituteUuid],
        );

      // maxBorrows is likely inside an array (since `.query()` returns raw SQL results)
      const maxBorrows = libraryConfig[0]?.maxBooksStudent ?? 1;
      const returnDays = libraryConfig[0]?.maxDaysStudent ?? 1;

      console.log(student.studentUuid, maxBorrows);
      const studentPreviousBorrows = await this.booklogRepository
        .createQueryBuilder('booklog')
        .where('booklog."borrowerUuid" = :uuid', { uuid: student.studentUuid })
        .orderBy('booklog."createdAt"', 'DESC') // Replace with actual column name
        .limit(maxBorrows)
        .getMany();

      switch (status) {
        case 'borrowed':
          if (!bookCopy) {
            throw new HttpException('Cannot find Book', HttpStatus.NOT_FOUND);
          }
          console.log("here")

          const allBorrowed =
            studentPreviousBorrows.length === maxBorrows &&
            studentPreviousBorrows.every((log) => log.action === 'borrowed');
          if (allBorrowed) {
            throw new Error(
              'Student has already taken the maximum number of books.',
            );
          }
          // TODO: Add a check for number of borrows per sole
          let bookTitle = await this.booktitleRepository.findOne({
            where: {
              bookUuid: bookCopy.bookTitleUuidRel,
            },
          });
          if (!bookTitle) {
            throw new HttpException(
              'Cannot find Book Title',
              HttpStatus.NOT_FOUND,
            );
          }
          bookCopy.isAvailable = false;
          bookCopy.updatedAt = new Date();
          const newBookCopy = await this.bookcopyRepository.save(bookCopy);
          bookTitle.availableCount -= 1;
          bookTitle.updatedAt = new Date();
          const newBookTitle = await this.booktitleRepository.save(bookTitle);
          const returnDate = new Date();
          returnDate.setDate(returnDate.getDate() + returnDays);
          returnDate.setHours(0, 0, 0, 0);
          let bookLog = this.booklogRepository.create({
            borrowerUuid: student.studentUuid,
            bookCopyUuid: bookCopy.bookCopyUuid,
            action: 'borrowed',
            ipAddress,
            newBookCopy,
            newBookTitle,
            expectedDate: returnDate,
          });
          await this.booklogRepository.save(bookLog);
          break;
        case 'in_library_borrowed':
          if (!bookCopy) {
            throw new HttpException('Cannot find Book', HttpStatus.NOT_FOUND);
          }
          // TODO: Add a check for number of borrows per sole
          const bookTitleLib = await this.booktitleRepository.findOne({
            where: {
              bookUuid: bookCopy.bookTitleUuidRel,
            },
          });
          if (!bookTitleLib) {
            throw new HttpException(
              'Cannot find Book Title',
              HttpStatus.NOT_FOUND,
            );
          }
          const bookLogLib = this.booklogRepository.create({
            borrowerUuid: student.studentUuid,
            bookCopyUuid: bookCopy.bookCopyUuid,
            action: 'in_library_borrowed',
            ipAddress,
          });
          await this.booklogRepository.save(bookLogLib);
          bookCopy.isAvailable = false;
          bookCopy.updatedAt = new Date();
          await this.bookcopyRepository.save(bookCopy);
          bookTitleLib.availableCount -= 1;
          bookTitleLib.updatedAt = new Date();
          await this.booktitleRepository.save(bookTitleLib);
          break;
        case 'returned':
          if (!bookCopy) {
            throw new HttpException('Book isnt Borrowed', HttpStatus.NOT_FOUND);
          }
          const bookLogRet = await this.booklogRepository
            .createQueryBuilder('bookret')
            .where('bookret."borrowerUuid" = :uuid', {
              uuid: student.studentUuid,
            })
            .where('bookret."bookCopyUuid" = :bookCopyUuid', {
              bookCopyUuid: bookCopy.bookCopyUuid,
            })
            .orderBy('bookret."createdAt"', 'DESC') // Replace with actual column name
            .getOne();
          if (!bookLogRet) {
            throw new HttpException(
              'Book isnt Borrowed by Student',
              HttpStatus.NOT_FOUND,
            );
          }
          if(bookLogRet.expectedDate < new Date()) {
            throw new HttpException(
              'First pay the Penalty on the previous book',
              HttpStatus.NOT_FOUND,
            );
          }
          bookLogRet.isReturned = true;
          await this.booklogRepository.save(bookLogRet);
          bookCopy.isAvailable = true;
          bookCopy.updatedAt = new Date();
          const newBookCopy2 = await this.bookcopyRepository.save(bookCopy);
          const bookTitleRet = await this.booktitleRepository.findOne({
            where: {
              bookUuid: bookCopy.bookTitleUuidRel,
            },
          });
          if (!bookTitleRet) {
            throw new HttpException(
              'Cannot find Book Title',
              HttpStatus.NOT_FOUND,
            );
          }
          bookTitleRet.availableCount += 1;
          bookTitleRet.updatedAt = new Date();
          const newBookTitle2 =
            await this.booktitleRepository.save(bookTitleRet);

          const borrowedRet = this.booklogRepository.create({
            action: 'returned',
            borrowerUuid: student.studentUuid,
            bookCopyUuid: bookCopy.bookCopyUuid,
            ipAddress,
            newBookCopy: newBookCopy2,
            newBookTitle: newBookTitle2,
            isReturned: true,
          });
          await this.booklogRepository.save(borrowedRet);
          break;
      }

      return {
        data: { message: 'Book action completed successfully' },
        pagination: null,
      };
    } catch (error) {
      throw error;
    }
  }

  // async getCurrentBorrowedOfStudent({
  //   student_id,
  //   page,
  //   limit,
  // }: {
  //   student_id: string;
  //   page: number;
  //   limit: number;
  // }) {
  //   try {
  //     const offset = (page - 1) * limit;
  //     const result: any[] = await this.booklogRepository.query(
  //       `SELECT bt.book_title, bt.book_uuid, bc.barcode, bt.department, fp.created_at FROM fees_penalties fp LEFT JOIN book_copies bc ON fp.copy_uuid = bc.book_copy_uuid LEFT JOIN
  //       book_titles bt ON bc.book_title_uuid = bt.book_uuid
  //       WHERE fp.is_completed = false AND fp.borrower_uuid = $1 ORDER BY fp.created_at DESC  LIMIT $2 OFFSET $3
  //       `,
  //       //         ` SELECT  book_copies.book_copy_id, book_titles.book_title, fees_penalties.created_at, fees_penalties.returned_at, book_titles.department FROM book_titles INNER JOIN book_copies ON book_titles.book_uuid= book_copies.book_title_uuid
  //       //           INNER JOIN fees_penalties ON fees_penalties.book_copy_uuid =book_copies.book_copy_uuid
  //       //          INNER JOIN students_table ON fees_penalties.borrower_uuid = students_table.student_uuid  WHERE student_id=$1
  //       //  LIMIT $2 OFFSET $3`,
  //       [student_id, limit, offset],
  //     );
  //     const totalCount = await this.booklogRepository.query(
  //       `SELECT COUNT(*) FROM fees_penalties WHERE is_completed = false AND borrower_uuid = $1`,
  //       //         `SELECT COUNT(*)
  //       //         FROM book_titles
  //       //         INNER JOIN book_copies ON book_titles.book_uuid = book_copies.book_title_uuid
  //       //         INNER JOIN fees_penalties ON fees_penalties.book_copy_uuid = book_copies.book_copy_uuid
  //       //         INNER JOIN students_table ON fees_penalties.borrower_uuid = students_table.student_uuid
  //       //         WHERE student_id = $1;
  //       // `,
  //       [student_id],
  //     );
  //     if (result.length === 0) {
  //       throw new HttpException(
  //         'Book log data not found',
  //         HttpStatus.NOT_FOUND,
  //       );
  //     }
  //     return {
  //       data: result,
  //       pagination: {
  //         total: parseInt(totalCount[0].count, 10),
  //         page,
  //         limit,
  //         totalPages: Math.ceil(parseInt(totalCount[0].count, 10) / limit),
  //       },
  //     };
  //   } catch (error) {
  //     throw error;
  //   }
  // }
}
