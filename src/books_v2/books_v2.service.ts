import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookCopy } from './entity/books_v2.copies.entity';
import { BookTitle } from './entity/books_v2.title.entity';

import { CreateBookCopyDTO } from './zod/createcopydto';
import { TCreateBookZodDTO } from './zod/createbookdtozod';
import { insertQueryHelper } from 'src/custom-query-helper';
import { TisbnBookZodDTO } from './zod/isbnbookzod';
import { TupdatearchiveZodDTO } from './zod/uarchive';
import { UpdateBookTitleDTO } from './zod/updatebookdto';

@Injectable()
export class BooksV2Service {
  constructor(
    @InjectRepository(BookCopy)
    private readonly bookcopyRepository: Repository<BookCopy>,

    @InjectRepository(BookTitle)
    private readonly booktitleRepository: Repository<BookTitle>,
  ) {}

  // Find all books
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
    const querydata = insertQueryHelper(createBookpayload, [
      'source_of_acquisition',
      'date_of_acquisition',
      'bill_no',
      'language',
      'inventory_number',
      'accession_number',
      'barcode',
      'item_type',
      'institute_id',
      'created_by',
    ]);
    const bookTitleValid = await this.booktitleRepository.query(
      `select * from book_titles where isbn='${createBookpayload.isbn}'`,
    );
    // console.log(bookTitleValid.length);
    if (bookTitleValid.length == 0) {
      const booktitle = this.booktitleRepository.query(
        `insert into book_titles(${querydata.queryCol})values(${querydata.queryArg})`,
        querydata.values,
      );

      const querydata2 = insertQueryHelper(createBookpayload, [
        'book_title',
        'book_author',
        'name_of_publisher',
        'place_of_publication',
        'year_of_publication',
        'edition',
        'subject',
        'department',
        'call_number',
        'author_mark',
        'images',
        'additional_fields',
        'description',
        'no_pages',
        'no_preliminary',
      ]);
      const bookcopy = this.booktitleRepository.query(
        `insert into book_copies(${querydata2.queryCol})values(${querydata2.queryArg})`,
        querydata2.values,
      );
      console.log('new book');

      const bookisbn: { book_uuid: string; total_count: string }[] = await this
        .booktitleRepository
        .query(`SELECT book_uuid, COUNT(*) OVER (PARTITION BY isbn) AS total_count FROM 
        book_titles WHERE  isbn = '${createBookpayload.isbn}'GROUP BY book_uuid limit 1`);
      const update = this.booktitleRepository.query(
        `update book_copies set book_title_uuid='${bookisbn[0].book_uuid}' where isbn='${createBookpayload.isbn}'`,
      );
      console.log('new book foreing is getting updated');

      // count part is remaining and count is notupdating count is full remaining
      // const bookisbn2: { book_uuid: string; total_count: string; }[] = await this.booktitleRepository.query(`SELECT book_uuid, COUNT(*) OVER (PARTITION BY isbn) AS total_count FROM
      //   book_titles WHERE  isbn = '${data_isbn2}'GROUP BY book_uuid limit 1`)
      //   const update2= this.booktitleRepository.query(`update book_copies set book_title_uuid='${bookisbn[0].book_uuid}' where isbn='${data_isbn}'`)
      //   console.log("book is available book title book available and total count is updated ");
      // updating book_count

      console.log('update count in process');
      const count: { count: string }[] = await this.booktitleRepository
        .query(`SELECT 
 count(isbn)
FROM 
  book_copies
WHERE 
  isbn = '${createBookpayload.isbn}'

`);
      console.log(count);
      const update_count = await this.booktitleRepository.query(
        `update book_titles set total_count =${count[0].count} , available_count=${count[0].count} where  isbn='${createBookpayload.isbn}'`,
      );
    } else {
      //available
      // const updatecount = await this.booktitleRepository.query(`update book_titles set available_count=available_count+1,total_count=total_count+1 where isbn='${createBookpayload.isbn}' `)
      // console.log("book is available count is increasing");

      const querydata2 = insertQueryHelper(createBookpayload, [
        'book_title',
        'book_author',
        'name_of_publisher',
        'place_of_publication',
        'year_of_publication',
        'edition',
        'subject',
        'department',
        'call_number',
        'author_mark',
        'images',
        'additional_fields',
        'description',
        'no_pages',
        'no_preliminary',
      ]);
      const bookcopy = this.booktitleRepository.query(
        `insert into book_copies(${querydata2.queryCol})values(${querydata2.queryArg})`,
        querydata2.values,
      );
      const data_isbn = createBookpayload.isbn;
      console.log('book is available data inserted in book copies');
      // this is the part
      const bookisbn: { book_uuid: string; total_count: string }[] = await this
        .booktitleRepository
        .query(`SELECT book_uuid, COUNT(*) OVER (PARTITION BY isbn) AS total_count FROM 
    book_titles WHERE  isbn = '${data_isbn}'GROUP BY book_uuid limit 1`);
      const update = this.booktitleRepository.query(
        `update book_copies set book_title_uuid='${bookisbn[0].book_uuid}' where isbn='${data_isbn}'`,
      );

      console.log(
        'book is available book title book available and total count is updated ',
      );

      console.log('update count in process');
      const count: { count: string }[] = await this.booktitleRepository
        .query(`SELECT 
            count(isbn)
            FROM 
              book_copies
            WHERE 
              isbn = '${createBookpayload.isbn}'
    `);
      console.log(count);
      const update_count = await this.booktitleRepository.query(
        `update book_titles set total_count =${count[0].count} , available_count=${count[0].count} where  isbn='${createBookpayload.isbn}'`,
      );

      console.log('update count', update_count);
      const finalresult = await this.booktitleRepository.query(
        `select * from book_titles where isbn='${createBookpayload.isbn}' `,
      );
      return finalresult;
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
      await this.bookcopyRepository.query(
        `UPDATE book_titles SET is_archived = true WHERE book_uuid = $1`,
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

  // TODO: Create Direct Copy

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

  async fetchSingleCopyInfo(identifier: string) {
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

  // TODO: Work in Update
  async updateBookCopy(id: string, updateBookCopyPayload: any) {
    try {
      const bookCopy = await this.bookcopyRepository.query(
        `SELECT * FROM book_copies WHERE book_copy_uuid = $1 LIMIT 1`,
        [id],
      );

      console.log({bookCopy})

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
          updateBookCopyPayload.copy_description
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
      SELECT book_copies.source_of_acquisition, book_copies.date_of_acquisition, book_copies.bill_no,book_copies.language,book_copies.inventory_number, book_copies.accession_number,book_copies.barcode,book_copies.item_type,book_copies.remarks,book_titles.book_title,book_titles.book_author,book_titles.name_of_publisher,book_titles.place_of_publication,book_titles.year_of_publication,book_titles.edition,book_titles.subject,book_titles.department,book_titles.call_number,book_titles.author_mark,book_titles.images,book_titles.additional_fields,book_titles.description,book_titles.no_pages,book_titles.no_preliminary  FROM book_titles INNER JOIN book_copies on book_titles.book_uuid = book_copies.book_title_uuid where book_titles.isbn='${isbn}' LIMIT 1
      `);
    if (result.length === 0) {
      throw new Error('No data found');
    }
    return result;
  }
}
