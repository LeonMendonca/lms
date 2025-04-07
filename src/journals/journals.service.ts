import { concat, Subscription } from 'rxjs';
// import { journalCopyQueryValidator } from './validators/journalcopy.query-validator';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { JournalCopy, TJournalCopy } from './entity/journals_copy.entity';
import { JournalTitle, TJournalTitle } from './entity/journals_title.entity';
import { JournalLogs, TJournalLogs } from './entity/journals_log.entity';
import { TCreateJournalZodDTO } from './zod-validation/createjournaldto-zod';
import {
  insertQueryHelper,
  updateQueryHelper,
} from 'src/misc/custom-query-helper';
import {
  TUpdateJournalTitleDTO,
  updateJournalSchema,
} from './zod-validation/updatejournaldto';
import { student, Students } from 'src/students/students.entity';
import { TCreateJournalLogDTO } from './zod-validation/create-journallog-zod';
import { Request } from 'express';
import { title } from 'process';
import { Console } from 'console';
import { json } from 'stream/consumers';
import { TUpdatePeriodicalDTO } from './zod-validation/update-journacopydto-zod';
import { CreateWorker } from 'src/worker-threads/worker-main-thread';
import { Chunkify } from 'src/worker-threads/chunk-array';
import { TPeriodicalCopyIdDTO } from './zod-validation/bulk-delete-periodical-copies-zod';
import { genIdForTitle } from './id-generation/create-periodical_title-id';
import { create } from 'domain';
import { FeesPenalties } from 'src/fees-penalties/entity/fees-penalties.entity';
import { ReplOptions, start } from 'repl';
import { differenceInDays, startOfDay } from 'date-fns';
import { genIdForCopies } from './id-generation/create-periodical_copy-id';
import { TIssueLogDTO } from './zod-validation/issue-zod';
import { BookCopy } from 'src/books_v2/entity/books_v2.copies.entity';
import { BookTitle } from 'src/books_v2/entity/books_v2.title.entity';
import { Booklog_v2 } from 'src/books_v2/entity/book_logv2.entity';
import { ConfigController } from 'src/config/config.controller';
import { InstituteConfig } from 'src/config/entity/institute_config.entity';

@Injectable()
export class JournalsService {
  constructor(
    // periodicals
    @InjectRepository(JournalLogs)
    private journalLogRepository: Repository<JournalLogs>,

    @InjectRepository(JournalCopy)
    private journalsCopyRepository: Repository<JournalCopy>,

    @InjectRepository(JournalTitle)
    private journalsTitleRepository: Repository<JournalTitle>,

    // students
    @InjectRepository(Students)
    private studentsRepository: Repository<Students>,

    // fees n penalties
    @InjectRepository(FeesPenalties)
    private feesPenaltiesRepository: Repository<FeesPenalties>,

    // books
    @InjectRepository(BookTitle)
    private booksTitleRepository: Repository<BookTitle>,

    @InjectRepository(BookCopy)
    private booksCopyRepository: Repository<BookCopy>,

    @InjectRepository(Booklog_v2)
    private bookLogRepository: Repository<Booklog_v2>,

    @InjectRepository(InstituteConfig)
    private instituteConfigRepository: Repository<InstituteConfig>,

    private readonly dataSource: DataSource,
  ) { }

  // get all the books and periodicals - i can tmake it
  async getBooks() {
    const data = await this.journalsTitleRepository.query(
      `
      SELECT
  jt.institute_uuid,
  jt.name_of_publisher AS journal_publisher,
  jt.total_count AS journal_total_count,
  jc.journal_copy_id,
  jc.journal_title,
  jc.issn,

  bc.institute_uuid AS book_institute_uuid,
  bt.book_title,
  bt.book_author,
  bt.name_of_publisher AS book_publisher,
  bt.total_count AS book_total_count,
  bt.isbn,
  bt.year_of_publication

FROM journal_titles jt
JOIN journal_copy jc ON jt.journal_uuid = jc.journal_title_uuid

LEFT JOIN book_copies bc ON bc.institute_uuid = jt.institute_uuid
LEFT JOIN book_titles bt ON bt.book_uuid = bc.book_title_uuid;

        

      `
    )
      if(data.length === 0){
        return{message: "Nothing found"}
      }else{
        return data
      }
  }

  // ----- BOTH TABLE SIMULTAENOUS FUNCTIONS -----

  // working
  async getJournals(
    { page, limit, search }: { page: number; limit: number; search: string } = {
      page: 1,
      limit: 10,
      search: '',
    },
  ) {
    try {
      const offset = (page - 1) * limit;
      const searchQuery = search ? `${search}%` : '%';

      const institutes = ['a0e08cc6-c7e4-4e6a-b98e-38e8cef99b7c']

      // const journals = await this.journalsTitleRepository.query(
      //   `SELECT * FROM journal_copy WHERE is_archived=false AND institute_uuid= ANY($1)`, 
      //   [institutes]
      // );

      const journals = await this.journalsTitleRepository.query(
        `
        SELECT
    jt.journal_title_id,
    jt.name_of_publisher,
    jt.total_count,
    jt.volume_no,
    jt.subscription_start_date,
    jt.subscription_end_date
  FROM journal_titles jt
  INNER JOIN journal_copy jc ON jc.journal_title_uuid = jt.journal_uuid
  WHERE jt.is_archived = false
    AND jc.is_archived = false
    AND jc.institute_uuid = ANY($1)
  GROUP BY jt.journal_uuid, jt.journal_title_id, jt.name_of_publisher, jt.total_count, jt.volume_no, jt.subscription_start_date, jt.subscription_end_date`,
        [institutes]
      )
      console.log(journals);
      const total = await this.journalsTitleRepository.query(
        `SELECT COUNT(*) AS count FROM journal_titles WHERE is_archived=false AND available_count>0`,
      );
      return {
        data: journals,
        pagination: {
          total: parseInt(total[0].count, 10),
          page,
          limit,
          totalPages: Math.ceil(parseInt(total[0].count, 10) / limit),
        },
      };
    } catch (error) {
      throw new HttpException(
        'Error fetching Journals',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPeriodicalLogs(
    { page, limit, search }: { page: number; limit: number; search: string } = {
      page: 1,
      limit: 10,
      search: '',
    },
  ) {
    const result = await this.journalLogRepository.query(
      `SELECT * FROM journal_logs`,
    );
    const total = await this.journalsTitleRepository.query(
      `SELECT COUNT(*) AS count FROM journal_logs`,
    );
    if (result.length === 0) {
      return { message: 'No Logs Exist' };
    } else {
      return {
        data: result,
        pagination: {
          total: parseInt(total[0].count, 10),
          page,
          limit,
          totalPages: Math.ceil(parseInt(total[0].count, 10) / limit),
        },
      };
    }
  }

  // Note : Not implemented in frontend
  async searchJournalsByID({
    journal_title_id,
    journal_copy_uuid,
    journal_log_uuid,
    action,
    description,
    issn,
    ip_address,
    borrower_uuid,
    page,
    limit,
    search,
  }: {
    journal_title_id: string;
    journal_copy_uuid: string;
    journal_log_uuid: string;
    action: string;
    description: string;
    issn: string;
    ip_address: string;
    borrower_uuid: string;
    page: number;
    limit: number;
    search: string;
  }) {
    try {
      if (
        !journal_title_id &&
        !journal_copy_uuid &&
        !journal_log_uuid &&
        !action &&
        !description &&
        !issn &&
        !ip_address &&
        !borrower_uuid
      ) {
        return { message: 'Give Parameters For Searching' };
      }
      // check if the journal_id exists in the db or not
      const journals = await this.journalsTitleRepository.query(
        `SELECT * FROM journal_titles WHERE journal_title_id=$1`,
        [journal_title_id],
      );

      if (journals.length) {
        return { journals: journals };
      } else {
        return { message: 'No Journal Found' };
      }
    } catch (error) {
      return { error };
    }
  }

  // working
  async searchPeriodicals({
    journal_uuid = '',
    journal_title_id = '',
    name_of_publisher = '',
    frequency = '',
    issue_number = '',
    vendor_name = '',
    library_name = '',
    classification_number = '',
    subscription_id = '',
    search = '',
  }: {
    journal_uuid?: string;
    journal_title_id?: string;
    name_of_publisher?: string;
    frequency?: string;
    issue_number?: string;
    vendor_name?: string;
    library_name?: string;
    classification_number?: string;
    subscription_id?: string;
    search?: string;
  }) {
    try {
      // const offset = (page - 1) * limit;
      const searchQuery = search ? `${search}%` : '%';

      if (
        !journal_uuid &&
        !journal_title_id &&
        !name_of_publisher &&
        !frequency &&
        !issue_number &&
        !vendor_name &&
        !library_name &&
        !classification_number &&
        !subscription_id
        // && !barcode && !item_type && !institute_uuid
      ) {
        return { message: 'Enter Parameter(s) To Search' };
      }

      const queryParams: string[] = [];
      let query = `SELECT * FROM journal_titles WHERE 1=1`;

      if (journal_uuid) {
        query += ` AND journal_uuid = $${queryParams.length + 1}`;
        queryParams.push(journal_uuid);
      }
      if (journal_title_id) {
        query += ` AND journal_title_id = $${queryParams.length + 1}`;
        queryParams.push(journal_title_id);
      }
      if (name_of_publisher) {
        query += ` AND name_of_publisher LIKE $${queryParams.length + 1}`;
        queryParams.push(`${name_of_publisher}%`);
      }
      if (frequency) {
        query += ` AND frequency = $${queryParams.length + 1}`;
        queryParams.push(frequency);
      }
      if (issue_number) {
        query += ` AND issue_number = $${queryParams.length + 1}`;
        queryParams.push(issue_number);
      }
      if (vendor_name) {
        query += ` AND vendor_name = $${queryParams.length + 1}`;
        queryParams.push(vendor_name);
      }
      if (library_name) {
        query += ` AND library_name = $${queryParams.length + 1}`;
        queryParams.push(library_name);
      }
      if (classification_number) {
        query += ` AND classification_number = $${queryParams.length + 1}`;
        queryParams.push(classification_number);
      }
      if (subscription_id) {
        query += ` AND subscription_id = $${queryParams.length + 1}`;
        queryParams.push(subscription_id);
      }
      const journal = await this.journalsTitleRepository.query(
        query,
        queryParams,
      );
      if (journal.length === 0) {
        throw new HttpException('Periodical not found', HttpStatus.NOT_FOUND);
      }
      const journals = await this.journalsCopyRepository.query(
        `SELECT * FROM journal_copy WHERE is_archived = false AND is_available=true AND journal_title_uuid = $1`,
        [journal[0].journal_uuid],
      );

      const total = await this.journalsTitleRepository.query(
        `SELECT COUNT(*) as count FROM journal_titles WHERE is_archived = false AND available_count>0 AND subscription_id ILIKE $1`,
        [searchQuery],
      );
      return journals;
    } catch (error) {
      throw new HttpException(
        'Error fetching Periodicals',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }


  // working
  async getJournalLogDetailsByTitle({
    journal_log_uuid,
    issn,
  }: {
    journal_log_uuid: string;
    issn: string;
  }) {
    try {
      const logs = await this.journalLogRepository.query(
        `SELECT * FROM journal_logs WHERE journal_log_uuid = $1`,
        [journal_log_uuid],
      );
      return {
        data: logs,
      };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Error fetching Journals',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // working
  async getJournalLogDetailsByCopy({ barcode }: { barcode: string }) {
    try {
      const journal = await this.journalsCopyRepository.query(
        `SELECT * FROM journal_copy WHERE barcode = $1`,
        [barcode],
      );

      const logs = await this.journalLogRepository.query(
        `SELECT * FROM journal_logs WHERE journal_copy_uuid = $1`,
        [journal[0].journal_copy_uuid],
      );
      return {
        data: logs,
      };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Error fetching Journals',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // working
  async getAllAvailableJournalsOrByIssn(
    {
      issn,
      page,
      limit,
      search,
    }: { issn: string; page: number; limit: number; search: string } = {
        issn: '',
        page: 1,
        limit: 10,
        search: '',
      },
  ) {
    try {
      const offset = (page - 1) * limit;
      let journals = [];

      if (issn.length) {
        journals = await this.journalsCopyRepository.query(
          `SELECT * FROM journal_copy WHERE issn=$1 ANd is_archived=false AND is_available=true`,
          [issn],
        );
      } else {
        journals = await this.journalsCopyRepository.query(
          `SELECT * FROM journal_copy WHERE is_archived = false AND is_available = true LIMIT $1 OFFSET $2`,
          [limit, offset],
        );
      }

      const total = await this.journalsCopyRepository.query(
        `SELECT COUNT(*) as count FROM journal_copy WHERE is_archived = false AND is_available = true`,
      );

      return {
        data: journals,
        pagination: {
          total: parseInt(total[0].count, 10),
          page,
          limit,
          totalPages: Math.ceil(parseInt(total[0].count, 10) / limit),
        },
      };
    } catch (error) {
      throw new HttpException(
        'Error fetching Journals',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // working
  async getAvailableJournalByIssn(issn: string) {
    try {
      const journalTitle = await this.journalsTitleRepository.query(
        `SELECT * FROM journal_titles WHERE issn = $1 LIMIT 1`,
        [issn],
      );
      console.log({ journalTitle });
      const result = await this.journalsCopyRepository.query(
        `SELECT * FROM journal_copy WHERE journal_title_uuid = $1 AND is_available = true AND is_archived = false`,
        [journalTitle[0].journal_uuid],
      );
      return result;
    } catch (error) {
      console.error('Error getting journal in library:', error);
      throw new HttpException(
        'Error getting journal in library',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // async createJournalLog(journalLogPayload: TCreateJournalLogDTO) {
  //     try {
  //         //Check if journal exists in JournalTitle Table
  //         let journalTitleUUID: [{ journal_uuid: string }] = await this.journalsTitleRepository.query(
  //             `SELECT journal_uuid FROM journal_titles WHERE issn = $1`,
  //             [journalLogPayload.issn],
  //         );

  //         //Book Title Table logic
  //         if (!journalTitleUUID.length) {
  //             //Create custom Book Id
  //             const max: [{ max: null | string }] = await this.journalsTitleRepository.query(`SELECT MAX(journal_title_id) FROM journal_titles`);
  //             const journalId = genJournalId(max[0].max, 'BT');
  //             const journalTitlePayloadWithId = { ...journalLogPayload, journal_title_id: journalId };

  //             //Create the required Columns, Arg, and Values
  //             //Ignore the Columns that are used by Copy table
  //             const journalLogQueryData = insertQueryHelper(journalTitlePayloadWithId, [
  //                 'action','barcode','issn','journal_copy_id','journal_title_id','student_id'
  //             ]);

  //             //Convert some specific fields to string
  //             journalLogQueryData.values.forEach((element, idx) => {
  //                 if (Array.isArray(element) || typeof element === 'object') {
  //                     journalLogQueryData.values[idx] = JSON.stringify(element);
  //                 }
  //             });
  //             journalTitleUUID = await this.journalsTitleRepository.query
  //                 (
  //                     `INSERT INTO journal_logs (${journalLogQueryData.queryCol}) VALUES (${journalLogQueryData.queryArg}) RETURNING journal_copy_uuid`,
  //                     journalLogQueryData.values
  //                 );
  //         } else {
  //             await this.journalsTitleRepository.query
  //                 (
  //                     `UPDATE journal_titles SET total_count = total_count + 1, available_count = available_count + 1, updated_at = NOW() WHERE issn = $1`,
  //                     [journalLogPayload.issn],
  //                 );
  //         }
  //         //Book Copy Table logic

  //         //Create custom Book Id
  //         const max: [{ max: null | string }] = await this.journalsTitleRepository.query(`SELECT MAX(journal_copy_id) FROM journal_copy`);
  //         const journalId = genJournalId(max[0].max, 'BC');
  //         const journalCopyPayloadWithId = { ...journalLogPayload, journal_copy_id: journalId, journal_title_uuid: journalTitleUUID[0].journal_uuid };

  //         //Create the required Columns, Arg, and Values
  //         //Ignore the Columns that are used by Title table
  //         const journalCopyQueryData = insertQueryHelper(journalCopyPayloadWithId, [
  //             'journal_title', 'journal_author', 'name_of_publisher', 'place_of_publication',
  //             'year_of_publication', 'edition', 'issn', 'no_of_pages', 'no_of_preliminary', 'subject',
  //             'department', 'call_number', 'author_mark', 'title_images', 'title_description', 'title_additional_fields'
  //         ]);

  //         //Convert some specific fields to string
  //         journalCopyQueryData.values.forEach((element, idx) => {
  //             if (Array.isArray(element) || typeof element === 'object') {
  //                 journalCopyQueryData.values[idx] = JSON.stringify(element);
  //             }
  //         });

  //         await this.journalsCopyRepository.query
  //             (
  //                 `INSERT INTO journal_copy (${journalCopyQueryData.queryCol}) VALUES (${journalCopyQueryData.queryArg})`,
  //                 journalCopyQueryData.values
  //             );
  //         return { statusCode: HttpStatus.CREATED, message: "Journal created" }
  //     } catch (error) {
  //         throw error
  //     }
  // }

  // async journalReturned(
  //     journalLogPayload: Omit<TCreateJournalLogDTO, 'action'>,
  //     request: Request,
  //     status: 'returned'
  // ) {
  //     try {
  //         if (!request.ip) {
  //             throw new HttpException("Unable to get IP address of the Client", HttpStatus.INTERNAL_SERVER_ERROR);
  //         }
  //         const studentExists: { student_uuid: string }[] = await this.studentsRepository.query(
  //             `SELECT student_uuid FROM students_table WHERE student_id = $1`,
  //             [journalLogPayload.student_id],
  //         );

  //         if (!studentExists.length) {
  //             throw new HttpException('Cannot find Student ID', HttpStatus.NOT_FOUND);
  //         }

  //         //Check if Book exists in Book Copies as not available
  //         //Insert into old_book_copy COLUMN
  //         const journalPayloadFromJournalCopies: TJournalCopy[] = await this.journalsCopyRepository.query
  //             (
  //                 `SELECT * FROM journal_copy WHERE journal_copy_id = $1 AND barcode = $2 AND is_available = FALSE`,
  //                 [journalLogPayload.journal_copy_id, journalLogPayload.barcode]
  //             );

  //         if (!journalPayloadFromJournalCopies.length) {
  //             throw new HttpException("Cannot find Borrowed Journal", HttpStatus.NOT_FOUND);
  //         }

  //         const journalBorrowedPayload: TJournalLogs[] = await this.journalLogRepository.query(
  //             `SELECT * FROM journal_logs WHERE borrower_uuid = $1 AND journal_copy_uuid = $2 AND action = 'borrowed'`,
  //             [studentExists[0].student_uuid, journalPayloadFromJournalCopies[0].journal_copy_uuid]
  //         );

  //         //if student doesn't exist in Booklog table (it hasn't borrowed), or it isn't the book that it borrowed, but attempting to return it
  //         if (!journalBorrowedPayload.length) {
  //             throw new HttpException('Student hasn\'t borrowed at all, or Invalid Journal is being returned', HttpStatus.NOT_FOUND);
  //         }

  //         //Check if Book hasn't reached its total count in Book Titles through book_title_uuid received from Book Copies via SELECT query
  //         //Insert into old_book_title COLUMN
  //         const journalPayloadFromBookTitle: TJournalTitle[] = await this.journalsCopyRepository.query
  //             (
  //                 `SELECT * FROM journal_titles WHERE journal_uuid = $1 AND available_count != total_count`,
  //                 [journalPayloadFromJournalCopies[0].journal_title_uuid]
  //             )

  //         if (!journalPayloadFromBookTitle.length) {
  //             throw new HttpException("Seems like Journal is fully returned in Journal Titles, but exists in Journal Log as not returned", HttpStatus.INTERNAL_SERVER_ERROR);
  //         }

  //         //UPDATING now is safe
  //         //Insert into new_book_copy
  //         const updatedJournalCopiesPayload: [TJournalCopy[], 0 | 1] = await this.journalsCopyRepository.query
  //             (
  //                 `UPDATE journal_copy SET is_available = TRUE WHERE journal_copy_uuid = $1 AND barcode = $2 AND is_available = FALSE
  //         RETURNING *`,
  //                 [journalPayloadFromJournalCopies[0].journal_copy_uuid, journalPayloadFromJournalCopies[0].barcode],
  //             );

  //         const updateStatus = updatedJournalCopiesPayload[1];
  //         if (!updateStatus) {
  //             //if somehow the update fails, even after getting the data through SELECT query
  //             throw new HttpException("Failed to update Journal", HttpStatus.INTERNAL_SERVER_ERROR);
  //         }

  //         if (!updatedJournalCopiesPayload[0].length) {
  //             //if for some reason update array response is empty, then
  //             throw new HttpException("Something went wrong", HttpStatus.INTERNAL_SERVER_ERROR);
  //         }

  //         const journalTitleUUID = updatedJournalCopiesPayload[0][0].journal_title_uuid;
  //         const journalCopyUUID = updatedJournalCopiesPayload[0][0].journal_copy_uuid;

  //         //Insert into new_book_copy COLUMN
  //         const updatedJournalTitlePayload: [TJournalTitle[], 0 | 1] = await this.journalsTitleRepository.query
  //             (
  //                 `UPDATE journal_titles SET available_count = available_count + 1 WHERE journal_uuid = $1 RETURNING *`,
  //                 [journalTitleUUID]
  //             );

  //         const oldJournalCopy = JSON.stringify(journalPayloadFromJournalCopies[0]);
  //         const newJournalCopy = JSON.stringify(updatedJournalCopiesPayload[0][0]);

  //         const oldJournalTitle = JSON.stringify(journalPayloadFromBookTitle[0]);
  //         const newJournalTitle = JSON.stringify(updatedJournalTitlePayload[0][0]);

  //         await this.journalLogRepository.query
  //             (
  //                 `INSERT INTO journal_logs (
  //           borrower_uuid, journal_copy_uuid, action, description, journal_title_uuid,
  //           old_journal_copy, new_journal_copy, old_journal_title, new_journal_title, ip_address
  //         ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
  //                 [
  //                     studentExists[0].student_uuid, journalCopyUUID, status, 'Journal has been returned', journalTitleUUID,
  //                     oldJournalCopy, newJournalCopy, oldJournalTitle, newJournalTitle, request.ip
  //                 ]
  //             );

  //         return { statusCode: HttpStatus.CREATED, message: "Journal returned successfully" };
  //     } catch (error) {
  //         throw error;
  //     }
  // }

  // start

  //   use for the issue route
  async periodicalReturned(
    journalLogPayload: Omit<TCreateJournalLogDTO, 'action'>,
    request: Request,
    status: 'returned',
    category,
  ) {
    try {
      if (!request.ip) {
        throw new HttpException(
          'Unable to get IP address of the Student',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      await this.dataSource.transaction(async (transactionalEntityManager) => {
        // 1. Validate Student ID Exists
        const studentExists = await transactionalEntityManager.query(
          `SELECT * FROM students_table WHERE student_id = $1`,
          [journalLogPayload.student_id],
        );

        if (studentExists.length === 0) {
          throw new HttpException('Invalid Student ID', HttpStatus.BAD_REQUEST);
        }

        // 2. Check if Journal Copy Exists and is Issued (is_available = false)
        const journalData = await transactionalEntityManager.query(
          `SELECT * FROM journal_copy WHERE journal_copy_id=$1 AND is_available=false`,
          [journalLogPayload.copy_id],
        );

        if (journalData.length === 0) {
          throw new HttpException(
            'Periodical is not issued or does not exist',
            HttpStatus.BAD_REQUEST,
          );
        }
        const journal_title_uuid = journalData[0].journal_title_uuid;
        const journal_copy_uuid = journalData[0].journal_copy_uuid;

        // 3. Check if Periodical Exists in Titles
        const oldTitle = await transactionalEntityManager.query(
          `SELECT * FROM journal_titles WHERE journal_uuid=$1 AND is_archived=false`,
          [journal_title_uuid],
        );

        if (oldTitle.length === 0) {
          throw new HttpException(
            'Periodical title not found or archived',
            HttpStatus.BAD_REQUEST,
          );
        }

        // 4. Ensure available_count does not exceed total_count
        if (oldTitle[0].available_count >= oldTitle[0].total_count) {
          throw new HttpException(
            'Cannot return periodical. Available count already at maximum.',
            HttpStatus.BAD_REQUEST,
          );
        }

        // 5. Update Available Count in journal_titles
        const newTitle = await transactionalEntityManager.query(
          `UPDATE journal_titles SET available_count = available_count + 1 
          WHERE journal_uuid=$1 AND available_count < total_count RETURNING *`,
          [journal_title_uuid],
        );

        if (newTitle.length === 0) {
          throw new HttpException(
            'Failed to update available count',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }

        // 6. Mark Journal Copy as Available
        const newCopyData = await transactionalEntityManager.query(
          `UPDATE journal_copy SET is_available=true 
          WHERE journal_copy_id=$1 RETURNING *`,
          [journalLogPayload.copy_id],
        );

        if (newCopyData.length === 0) {
          throw new HttpException(
            'Failed to update Journal Copy availability',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }

        const journalTitleUUID = oldTitle[0].journal_uuid;
        const journalCopyUUID = journalData[0].journal_copy_uuid;

        // 7. Insert Log Entry
        await transactionalEntityManager.query(
          `INSERT INTO journal_logs 
            (old_journal_copy, new_journal_copy, old_journal_title, new_journal_title, 
            action, description, issn, ip_address, borrower_uuid, journal_title_uuid, journal_copy_uuid)  
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            JSON.stringify(journalData[0]),
            JSON.stringify(newCopyData[0]),
            JSON.stringify(oldTitle[0]),
            JSON.stringify(newTitle[0]),
            status, // 'returned'
            'Book has been returned',
            journalData[0].issn,
            request.ip,
            studentExists[0].student_uuid,
            journalTitleUUID,
            journalCopyUUID,
          ],
        );

        // 8. Insert Into The Fees-n-Penalties Table
        const penaltyData = await this.feesPenaltiesRepository.query(
          `SELECT return_date FROM fees_penalties WHERE copy_uuid=$1`,
          [journal_copy_uuid],
        );

        if (penaltyData.length === 0) {
          throw new HttpException(
            'Return date record not found for penalty calculation',
            HttpStatus.BAD_REQUEST,
          );
        }

        // Extract return date
        const return_date = new Date(penaltyData[0].return_date);
        const returned_date = new Date(); // today

        // Calculate delayed days correctly
        let delayed_days = differenceInDays(returned_date, return_date);
        delayed_days = delayed_days < 0 ? 0 : delayed_days; // Ensure non-negative

        // Calculate penalty
        const penalty_amount = delayed_days > 0 ? delayed_days * 50 : 0;
        const is_penalised = delayed_days > 0;

        // Update penalty table
        await this.feesPenaltiesRepository.query(
          `UPDATE fees_penalties 
          SET days_delayed=$1, penalty_amount=$2, is_penalised=$3, returned_at=$4 
          WHERE copy_uuid=$5 RETURNING *`,
          [
            delayed_days,
            penalty_amount,
            is_penalised,
            returned_date,
            journal_copy_uuid,
          ],
        );
      });

      return {
        message: 'Periodical Returned Successfully',
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      console.error('Error returning Periodical:', error);
      throw new HttpException(
        'Error returning Periodical',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }


  //   async periodicalReturned(
  //     journalLogPayload: Omit<TCreateJournalLogDTO, 'action'>,
  //     request: Request,
  //     status: 'returned',
  //     category,
  //   ) {
  //     try {
  //       if (!request.ip) {
  //         throw new HttpException(
  //           'Unable to get IP address of the Student',
  //           HttpStatus.INTERNAL_SERVER_ERROR,
  //         );
  //       }

  //       await this.dataSource.transaction(async (transactionalEntityManager) => {
  //         // 1. Validate Student ID Exists
  //         const studentExists = await transactionalEntityManager.query(
  //           `SELECT * FROM students_table WHERE student_id = $1`,
  //           [journalLogPayload.student_id],
  //         );

  //         if (studentExists.length === 0) {
  //           throw new HttpException('Invalid Student ID', HttpStatus.BAD_REQUEST);
  //         }

  //         // 2. Check if Journal Copy Exists and is Issued (is_available = false)
  //         const journalData = await transactionalEntityManager.query(
  //           `SELECT * FROM journal_copy WHERE journal_copy_id=$1 AND is_available=false`,
  //           [journalLogPayload.copy_id],
  //         );

  //         if (journalData.length === 0) {
  //           throw new HttpException(
  //             'Periodical is not issued or does not exist',
  //             HttpStatus.BAD_REQUEST,
  //           );
  //         }
  //         const journal_title_uuid = journalData[0].journal_title_uuid;
  //         const journal_copy_uuid = journalData[0].journal_copy_uuid;

  //         // 3. Check if Periodical Exists in Titles
  //         const oldTitle = await transactionalEntityManager.query(
  //           `SELECT * FROM journal_titles WHERE journal_uuid=$1 AND is_archived=false`,
  //           [journal_title_uuid],
  //         );

  //         if (oldTitle.length === 0) {
  //           throw new HttpException(
  //             'Periodical title not found or archived',
  //             HttpStatus.BAD_REQUEST,
  //           );
  //         }

  //         // 4. Ensure available_count does not exceed total_count
  //         if (oldTitle[0].available_count >= oldTitle[0].total_count) {
  //           throw new HttpException(
  //             'Cannot return periodical. Available count already at maximum.',
  //             HttpStatus.BAD_REQUEST,
  //           );
  //         }

  //         // 5. Update Available Count in journal_titles
  //         const newTitle = await transactionalEntityManager.query(
  //           `UPDATE journal_titles SET available_count = available_count + 1 WHERE journal_uuid=$1 AND available_count<=total_count RETURNING *`,
  //           [journal_title_uuid],
  //         );

  //         if (newTitle.length === 0) {
  //           throw new HttpException(
  //             'Failed to update available count',
  //             HttpStatus.INTERNAL_SERVER_ERROR,
  //           );
  //         }

  //         // 6. Mark Journal Copy as
  //         const newCopyData = await transactionalEntityManager.query(
  //           `UPDATE journal_copy SET is_available=true WHERE journal_copy_id=$1 RETURNING *`,
  //           [journalLogPayload.copy_id],
  //         );

  //         if (newCopyData.length === 0) {
  //           throw new HttpException(
  //             'Failed to update Journal Copy availability',
  //             HttpStatus.INTERNAL_SERVER_ERROR,
  //           );
  //         }

  //         const journalTitleUUID = oldTitle[0].journal_uuid;
  //         const journalCopyUUID = journalData[0].journal_copy_uuid;

  //         // 7. Insert Log Entry
  //         await transactionalEntityManager.query(
  //           `INSERT INTO journal_logs 
  //                 (old_journal_copy, new_journal_copy, old_journal_title, new_journal_title, 
  //                 action, description, issn, ip_address, borrower_uuid, journal_title_uuid, journal_copy_uuid)  
  //                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
  //           [
  //             JSON.stringify(journalData[0]),
  //             JSON.stringify(newCopyData[0]),
  //             JSON.stringify(oldTitle[0]),
  //             JSON.stringify(newTitle[0]),
  //             status, // 'returned'
  //             'Book has been returned',
  //             journalData[0].issn,
  //             request.ip,
  //             studentExists[0].student_uuid,
  //             journalTitleUUID,
  //             journalCopyUUID,
  //           ],
  //         );

  //         // 8. Insert Into The Fees-n-Penalties Table
  //         // calculate delayed_days
  //         let return_date = await this.journalLogRepository.query(
  //           `SELECT return_date FROM fees_penalties WHERE copy_uuid=$1`,
  //           [journal_copy_uuid],
  //         );

  //         const returned_date = new Date(); // today
  //         let delayed_days = differenceInDays(
  //           startOfDay(return_date),
  //           startOfDay(returned_date),
  //         );
  //         delayed_days = delayed_days > 0 ? 0 : delayed_days;
  //         const penalty_amount = delayed_days < 0 ? delayed_days * 50 : 0;
  //         const is_penalised = delayed_days < 0 ? true : false;

  //         const penalty = await this.feesPenaltiesRepository.query(
  //           `UPDATE fees_penalties SET days_delayed=$1, penalty_amount=$2, is_penalised=$3, returned_at=$4 WHERE copy_uuid=$5 RETURNING *`,
  //           [
  //             delayed_days,
  //             penalty_amount,
  //             is_penalised,
  //             returned_date,
  //             journal_copy_uuid,
  //           ],
  //         );
  //       });
  //       return {
  //         message: 'Periodical Returned Successfully',
  //         statusCode: HttpStatus.OK,
  //       };
  //     } catch (error) {
  //       console.error('Error returning Periodical:', error);
  //       throw new HttpException(
  //         'Error returning Periodical',
  //         HttpStatus.INTERNAL_SERVER_ERROR,
  //       );
  //     }
  //   }

  // use for the issue route
  async periodicalBorrowed(
    journalLogPayload: Omit<TCreateJournalLogDTO, 'action'>,
    request: Request,
    status: 'borrowed' | 'in_library_borrowed',
    category,
  ) {
    try {

      // calculate the return date hence fetch the late_fees_per_day, max_days
      const late_fees_per_day = await this.feesPenaltiesRepository.query(
        ``
      )

      if (!request.ip) {
        throw new HttpException(
          'Unable to get IP address of the Student',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      await this.dataSource.transaction(async (transactionalEntityManager) => {
        // 1. Validate Student ID Exists
        const studentExists = await transactionalEntityManager.query(
          `SELECT * FROM students_table WHERE student_id = $1`,
          [journalLogPayload.student_id],
        );
        if (studentExists.length === 0) {
          throw new HttpException('Invalid Student ID', HttpStatus.BAD_REQUEST);
        }
        // store the student_uuid for using in fees_n_penalties
        const student_uuid = studentExists[0].student_uuid;
        const student_id = studentExists[0].student_id;

        // 2. Check if journal exists in the copies table
        const journalData = await transactionalEntityManager.query(
          `SELECT * FROM journal_copy WHERE journal_copy_id=$1 AND is_available=true AND is_archived=false LIMIT 1`,
          [journalLogPayload.copy_id],
        );
        if (journalData.length === 0) {
          throw new HttpException(
            'Invalid Barcode or Journal Copy is not available',
            HttpStatus.BAD_REQUEST,
          );
        }
        // store the journal_copy data for using in fees_n_penalties
        const journal_copy_uuid = journalData[0].journal_copy_uuid;
        const journal_copy_id = journalData[0].journal_copy_id;
        console.log('OLD PERIODICAL COPY DATA : ', journalData[0]);

        const journal_title_uuid = journalData[0].journal_title_uuid;

        // 3. Check if the journal exists in the title table
        const oldTitle = await transactionalEntityManager.query(
          `SELECT * FROM journal_titles WHERE journal_uuid=$1 AND is_archived=false`,
          [journal_title_uuid],
        );
        if (oldTitle.length === 0) {
          throw new HttpException(
            'Periodical title not found or archived',
            HttpStatus.BAD_REQUEST,
          );
        }
        if (oldTitle[0].available_count <= 0) {
          throw new HttpException(
            'No available periodicals for borrowing',
            HttpStatus.BAD_REQUEST,
          );
        }
        // store data for fees_n_penalties - store the return date properly
        let return_date = new Date();
        return_date.setDate(return_date.getDate() + 7);
        console.log('OLD PERIODICAL TITLE DATA : ', oldTitle[0]);

        const newTitle = await transactionalEntityManager.query(
          `UPDATE journal_titles SET available_count=available_count-1 WHERE journal_uuid=$1 AND available_count>0 RETURNING *`,
          [journal_title_uuid],
        );
        if (newTitle.length === 0) {
          throw new HttpException(
            'Failed to update available count',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
        console.log('NEW PERIODICAL TITLE DATA : ', newTitle[0]);

        // 4. Update Journal Copy Table
        const newCopyData = await transactionalEntityManager.query(
          `UPDATE journal_copy 
             SET is_available = 
                 CASE 
                     WHEN (SELECT COALESCE(available_count, 0) FROM journal_titles WHERE journal_uuid = $1) > 0 
                     THEN false 
                     ELSE true 
                 END 
             WHERE journal_copy_id = $2 
               AND is_archived = false 
             RETURNING *`,
          [journal_title_uuid, journalData[0].journal_copy_id],
        );

        if (newCopyData.length === 0) {
          throw new HttpException(
            'Failed to update Journal Copy availability',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }

        console.log('NEW PERIODICAL COPY DATA : ', newCopyData[0]);

        //   5. Update the fees n penalties data
        const penalty = await this.feesPenaltiesRepository.query(
          `INSERT INTO fees_penalties (category, borrower_uuid, copy_uuid, return_date) 
             VALUES ($1, $2, $3, $4) RETURNING fp_uuid`,
          [category, student_uuid, journal_copy_uuid, return_date],
        );

        // Ensure `fp_uuid` exists
        if (!penalty.length || !penalty[0].fp_uuid) {
          throw new HttpException(
            'Failed to insert Fees & Penalties or fetch fp_uuid',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }

        const fp_uuid = penalty[0].fp_uuid;

        // 6. Prepare periodical log data
        const oldJournalCopy = journalData[0];
        const newJournalCopyData = newCopyData[0];
        const oldJournalTitleData = oldTitle[0];
        const newJournalTitleData = newTitle[0];

        const journalTitleUUID = oldTitle[0].journal_uuid;
        const journalCopyUUID = oldJournalCopy.journal_copy_uuid;
        console.log(oldJournalCopy.journal_copy_uuid, journalTitleUUID);

        // 7. Insert Log Entry
        await transactionalEntityManager.query(
          `INSERT INTO journal_logs
             (old_journal_copy, new_journal_copy, old_journal_title, new_journal_title,
              action, description, issn, ip_address, borrower_uuid, journal_title_uuid, 
              journal_copy_uuid, fp_uuid)  -- Add fp_uuid column
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [
            JSON.stringify(oldJournalCopy),
            JSON.stringify(newJournalCopyData),
            JSON.stringify(oldJournalTitleData),
            JSON.stringify(newJournalTitleData),
            status,
            'Periodical has been borrowed',
            journalData[0].issn,
            request.ip,
            student_uuid,
            journalTitleUUID,
            journalCopyUUID,
            fp_uuid,
          ],
        );
      });
      return {
        message: 'Periodical Borrowed Successfully',
        statusCode: HttpStatus.CREATED,
      };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Error issuing Periodical',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // here

  // async periodicalBorrowed(
  //     journalLogPayload: Omit<TCreateJournalLogDTO, 'action'>,
  //     request: Request,
  //     status: 'borrowed' | 'in_library_borrowed'
  // ) {
  //     try {
  //         const studentExists = await this.studentsRepository.query(
  //             `SELECT * FROM students_table WHERE student_id = $1`,
  //             [journalLogPayload.student_id],
  //         );

  //         if (studentExists.length === 0) {
  //             console.error(' Invalid Student ID:', journalLogPayload.student_id);
  //             throw new HttpException('Invalid Student UUID', HttpStatus.BAD_REQUEST);
  //         }
  //         console.log("STUDENT : ", studentExists[0])

  //         const journalData = await this.journalsCopyRepository.query(
  //             `SELECT * FROM journal_copy WHERE barcode = $1 AND is_available = true AND is_archived=false LIMIT 1`,
  //             [journalLogPayload.barcode],
  //         );

  //         if (journalData.length === 0) {
  //             console.error(' Invalid Journal Copy ID:', journalLogPayload.journal_copy_id);
  //             throw new HttpException('Invalid Barcode', HttpStatus.BAD_REQUEST);
  //         }
  //         console.log("OLD PERIODICAL COPY DATA : ", journalData[0])

  //         const newCopyData = await this.journalsCopyRepository.query(
  //             `UPDATE journal_copy SET is_available = FALSE WHERE journal_copy_id = $1 AND barcode=$2 RETURNING *`,
  //             [journalLogPayload.journal_copy_id, journalLogPayload.barcode],
  //         );
  //         console.log("NEW PERIODICAL COPY DATA : ", newCopyData[0])

  //         const oldTitle = await this.journalsTitleRepository.query(
  //             `SELECT * FROM journal_titles WHERE subscription_id=$1 AND is_archived=false AND available_count != total_count`,
  //             [journalLogPayload.subscription_id]
  //         )
  //         console.log("OLD PERIODICAL TITLE DATA : ", oldTitle[0])

  //         const newTitle = await this.journalsTitleRepository.query(
  //             `UPDATE journal_titles SET available_count = available_count - 1 WHERE subscription_id = $1 RETURNING *`,
  //             [journalLogPayload.subscription_id],
  //         );
  //         console.log("NEW PERIODICAL TITLE DATA : ", newTitle[0])

  //         //  Fetch Old Book Copy Data
  //         const oldJournalCopy = journalData[0];
  //         const newJournalCopyData = newCopyData[0];

  //         const oldJournalTitleData = oldTitle[0];
  //         const newJournalTitleData = newTitle[0];

  //         const journalTitleUUID = newTitle[0].journal_uuid
  //         const journalCopyUUID = newCopyData[0].journal_copy_uuid

  //         const insertLogQuery = `INSERT INTO journal_logs (old_journal_copy, new_journal_copy, old_journal_title, new_journal_title, action, description, issn, ip_address, borrower_uuid, journal_title_uuid, journal_copy_uuid)  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`;

  //         const insertLogValues = [
  //             JSON.stringify(oldJournalCopy),
  //             JSON.stringify(newJournalCopyData),
  //             JSON.stringify(oldJournalTitleData),
  //             JSON.stringify(newJournalTitleData),
  //             'borrowed',
  //             'Book has been borrowed',
  //             journalData[0].issn,
  //             request.ip,
  //             studentExists[0].student_uuid,
  //             journalTitleUUID,
  //             journalCopyUUID
  //         ];

  //         await this.journalsTitleRepository.query(insertLogQuery, insertLogValues);
  //         return { message: 'Periodical Borrowed Successfully' };
  //     } catch (error) {
  //         console.error(' Error issuing Periodical:', error);
  //         throw new HttpException(
  //             'Error issuing Periodical',
  //             HttpStatus.INTERNAL_SERVER_ERROR,
  //         );
  //     }
  // }

  // here

  // working

  async getJournalLogsByJournalUUID(
    {
      page,
      limit,
      search,
    }: { page: number; limit: number; search?: string } = {
        page: 1,
        limit: 10,
        search: '',
      },
  ) {
    try {
      console.log(page, limit, search);
      const offset = (page - 1) * limit;
      const searchQuery = search ? `%${search}%` : '%';

      // Fetch journal logs with pagination
      const journals = await this.journalLogRepository.query(
        `SELECT * FROM journal_logs 
             WHERE journal_title_uuid::TEXT ILIKE $1  
             LIMIT $2 OFFSET $3;`,
        [searchQuery, limit, offset],
      );

      // Get total count for pagination
      const total = await this.journalLogRepository.query(
        `SELECT COUNT(*) as count FROM journal_logs 
             WHERE journal_title_uuid::TEXT ILIKE $1`,
        [searchQuery],
      );

      return {
        data: journals,
        pagination: {
          total: parseInt(total[0].count, 10),
          page,
          limit,
          totalPages: Math.ceil(parseInt(total[0].count, 10) / limit),
        },
      };
    } catch (error) {
      console.error('Error fetching Journal Logs:', error);
      throw new HttpException(
        'Error fetching Journals',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // working
  async getAllUnavailableJournals(
    {
      issn,
      page,
      limit,
      search,
    }: { issn: string; page: number; limit: number; search: string } = {
        issn: '',
        page: 1,
        limit: 10,
        search: '',
      },
  ) {
    try {
      const offset = (page - 1) * limit;
      let journals = [];

      if (issn.length) {
        journals = await this.journalsCopyRepository.query(
          `SELECT * FROM journal_copy WHERE issn=$1 ANd is_archived=true AND is_available=true`,
          [issn],
        );
      } else {
        journals = await this.journalsCopyRepository.query(
          `SELECT * FROM journal_copy WHERE is_archived = true AND is_available = true LIMIT $1 OFFSET $2`,
          [limit, offset],
        );
      }

      const total = await this.journalsCopyRepository.query(
        `SELECT COUNT(*) as count FROM journal_copy WHERE is_archived = true AND is_available = true`,
      );

      return {
        data: journals,
        pagination: {
          total: parseInt(total[0].count, 10),
          page,
          limit,
          totalPages: Math.ceil(parseInt(total[0].count, 10) / limit),
        },
      };
    } catch (error) {
      throw new HttpException(
        'Error fetching Journals',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async filterByCategory(
    {
      category,
      page,
      limit,
      search,
    }: { category: string; page: number; limit: number; search: string } = {
        category: '',
        page: 1,
        limit: 10,
        search: '',
      },
  ) {
    if (!category.length) {
      return { message: 'Enter The Category Type' };
    }

    // check if the category has some entries in the journal_titles db
    const periodical = await this.journalsTitleRepository.query(
      `SELECT * FROM journal_titles WHERE category=$1 AND is_archived=false AND available_count>0`,
      [category],
    );
    if (!periodical.length) {
      // throw error
      return { message: `No ${category}\'s Found` };
    } else {
      return { periodical };
    }
  }

  // working
  async getUnavailableJournalByIssn(issn: string) {
    try {
      const journalTitle = await this.journalsTitleRepository.query(
        ` SELECT * FROM journal_titles WHERE issn = $1 LIMIT 1 `,
        [issn],
      );
      console.log({ journalTitle });
      const result = await this.journalsCopyRepository.query(
        ` SELECT * FROM journal_copy  WHERE journal_title_uuid = $1 AND is_available = false AND is_archived = false`,
        [journalTitle[0].journal_uuid],
      );
      return result;
    } catch (error) {
      console.error('Error getting journal in library:', error);
      throw new HttpException(
        'Error getting journal in library',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // working
  async archivePeriodical(journal_uuid: string) {
    try {
      // Check if the book exists and is not archived
      const journal = await this.journalsTitleRepository.query(
        `SELECT * FROM journal_titles WHERE journal_uuid ='${journal_uuid}' AND is_archived = false`,
      );
      if (journal.length === 0) {
        throw new HttpException(
          'Periodical not found or already archived',
          HttpStatus.NOT_FOUND,
        );
      }
      // Update is_archived to true
      await this.journalsTitleRepository.query(
        `UPDATE journal_titles SET is_archived = true WHERE journal_uuid = $1`,
        [journal_uuid],
      );
      await this.journalsCopyRepository.query(
        `UPDATE journal_copy SET is_archived = true WHERE journal_title_uuid = $1`,
        [journal_uuid],
      );
      return { message: 'Periodical archived successfully' };
    } catch (error) {
      throw new HttpException(
        'Error archiving journal',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // working
  async searchJournalIssn(issn: string) {
    const query = `
        SELECT  
            jc.barcode, 
            jc.item_type, 
            jc.remarks,
            jt.journal_title,
            jt.name_of_publisher,
            jt.place_of_publication,
            jt.classification_number,
            jt.title_images,
            jt.title_additional_fields,
            jt.title_description,
            jt.issn 
        FROM journal_titles jt
        INNER JOIN journal_copy jc ON jt.journal_uuid = jc.journal_title_uuid
        WHERE jt.issn = $1
        LIMIT 1
    `;

    const result = await this.journalsTitleRepository.query(query, [issn]);
    if (!result.length) {
      throw new Error(`No data found for ISSN: ${issn}`);
    }
    return result[0];
  }

  // working

  // async createJournal(createJournalPayload: TCreateJournalZodDTO) {
  //   // Create a query runner instance
  //   const queryRunner = this.dataSource.createQueryRunner();

  //   // Start a transactions
  //   await queryRunner.startTransaction();

  //   try {
  //     console.log('Start');
  //     // Fetch total count
  //     const totalCountQuery = await queryRunner.query(
  //       `SELECT COUNT(*)::int AS total_count FROM journal_titles WHERE subscription_id = $1`,
  //       [createJournalPayload.subscription_id],
  //     );
  //     const total_count = totalCountQuery[0]?.total_count || 0;

  //     // Fetch available count
  //     const availableCountQuery = await queryRunner.query(
  //       `SELECT COUNT(*)::int AS available_count FROM journal_titles WHERE is_archived = false AND subscription_id = $1`,
  //       [createJournalPayload.subscription_id],
  //     );
  //     const available_count = availableCountQuery[0]?.available_count || 0;

  //     // Check if journal exists in JournalTitle Table
  //     let journalTitleUUID = await queryRunner.query(
  //       `SELECT * FROM journal_titles WHERE subscription_id = $1`,
  //       [createJournalPayload.subscription_id],
  //     );

  //     const title_id = journalTitleUUID[0].journal_title_id;
  //     console.log(title_id);
  //     // if two different journal in the title have the same subscription id then give the user the error to create a new subscription id by padding /01 or -01
  //     const subs_id_data = await this.journalsTitleRepository.query(
  //       `SELECT * FROM journal_titles WHERE subscription_id=$1 AND journal_title_id=$2`,
  //       [createJournalPayload.subscription_id, title_id],
  //     );
  //     if (subs_id_data.length > 1) {
  //       // throw `Periodical with the same Subscription Id [${createJournalPayload.subscription_id}] Exists. Add Another Subscription Id`
  //       return {
  //         message: `Periodical with the same Subscription Id [${createJournalPayload.subscription_id}] Exists. Add Another Subscription Id`,
  //       };
  //     }

  //     // Generate journal_title_id if not exists
  //     let journal_title_uuid: string;
  //     if (journalTitleUUID.length === 0) {
  //       // Create custom Journal Title ID (Ensure max value exists)
  //       const maxInstituteCountQuery = await queryRunner.query(
  //         `SELECT MAX(journal_titl) AS max_id FROM journal_titles`,
  //       );

  //       // console.log("Journal Title maxCount", maxInstituteCountQuery[0].max_id)

  //       const maxInstituteCount = maxInstituteCountQuery[0]?.max_id || '000';
  //       const instituteName = 'Thakur Institute of Aviation';
  //       journal_title_uuid = genIdForTitle(maxInstituteCount, instituteName);

  //       const journalTitlePayloadWithId = {
  //         ...createJournalPayload,
  //         journal_title_id: journal_title_uuid,
  //         subscription_id: createJournalPayload.subscription_id,
  //         total_count: total_count + 1,
  //         available_count: available_count + 1,
  //       };

  //       // Generate INSERT query for journal_titles
  //       const journalTitleQueryData = insertQueryHelper(
  //         journalTitlePayloadWithId,
  //         [
  //           'barcode',
  //           'item_type',
  //           'issn',
  //           'journal_title',
  //           'editor_name',
  //           'institute_uuid',
  //           'created_by',
  //           'remarks',
  //           'copy_images',
  //           'copy_additional_fields',
  //           'copy_description',
  //         ],
  //       );

  //       // Convert arrays/objects to strings for storage
  //       journalTitleQueryData.values.forEach((element, idx) => {
  //         if (Array.isArray(element) || typeof element === 'object') {
  //           journalTitleQueryData.values[idx] = JSON.stringify(element);
  //         }
  //       });

  //       // Insert journal title into DB and get the new UUID
  //       const result = await queryRunner.query(
  //         `INSERT INTO journal_titles (${journalTitleQueryData.queryCol}) VALUES (${journalTitleQueryData.queryArg}) RETURNING *`,
  //         journalTitleQueryData.values,
  //       );
  //       journalTitleUUID = result;
  //     } else {
  //       // If journal title already exists, update total_count and available_count
  //       await queryRunner.query(
  //         `UPDATE journal_titles SET total_count = total_count + 1, available_count = available_count + 1, updated_at = NOW() WHERE subscription_id = $1`,
  //         [createJournalPayload.subscription_id],
  //       );
  //       journal_title_uuid = journalTitleUUID[0]?.journal_title_id; // use the existing journal UUID
  //     }

  //     // console.log("journal_title_uuid : ", journal_title_uuid)

  //     // Generate journal_copy_id
  //     const maxCopyIdQuery = await queryRunner.query(
  //       `SELECT MAX(journal_copy_id) AS max_id FROM journal_copy WHERE journal_title_uuid=$1`,
  //       [journalTitleUUID[0].journal_uuid],
  //     );
  //     const maxCopyId = maxCopyIdQuery[0]?.max_id || '000';
  //     const journalCopyId = genIdForCopies(maxCopyId, journal_title_uuid);

  //     const journalCopyPayloadWithId = {
  //       ...createJournalPayload,
  //       journal_copy_id: journalCopyId,
  //       journal_title_uuid: journalTitleUUID[0].journal_uuid, // use the correct journal title uuid
  //       subscription_id: createJournalPayload.subscription_id,
  //       total_count: total_count + 1,
  //       available_count: available_count + 1,
  //     };

  //     // Generate INSERT query for journal_copy
  //     const journalCopyQueryData = insertQueryHelper(journalCopyPayloadWithId, [
  //       'category',
  //       'name_of_publisher',
  //       'place_of_publication',
  //       'subscription_start_date',
  //       'subscription_end_date',
  //       'volume_no',
  //       'frequency',
  //       'issue_number',
  //       'vendor_name',
  //       'subscription_price',
  //       'library_name',
  //       'classification_number',
  //       'title_images',
  //       'title_additional_fields',
  //       'title_description',
  //       'total_count',
  //       'available_count',
  //       'subscription_id',
  //     ]);

  //     // Convert arrays/objects to strings for storage
  //     journalCopyQueryData.values.forEach((element, idx) => {
  //       if (Array.isArray(element) || typeof element === 'object') {
  //         journalCopyQueryData.values[idx] = JSON.stringify(element);
  //       }
  //     });

  //     // Insert journal copy into DB
  //     await queryRunner.query(
  //       `INSERT INTO journal_copy (${journalCopyQueryData.queryCol}) VALUES (${journalCopyQueryData.queryArg})`,
  //       journalCopyQueryData.values,
  //     );

  //     // Commit the transaction if everything is successful
  //     await queryRunner.commitTransaction();

  //     // Return success response
  //     return { statusCode: HttpStatus.CREATED, message: 'Periodical Created!' };
  //   } catch (error) {
  //     // If anything fails, rollback the transaction
  //     await queryRunner.rollbackTransaction();

  //     // Log error details
  //     console.error('Error during journal creation:', error.message);
  //     console.error('Stack Trace:', error.stack);

  //     return {
  //       error: error.message || 'An error occurred while creating the journal.',
  //     };
  //   } finally {
  //     // Release the query runner after the transaction is complete (either commit or rollback)
  //     await queryRunner.release();
  //   }
  // }

  async createJournal(createJournalPayload: TCreateJournalZodDTO) {
    try {
      // Check if journal title exists
      const existingTitle: Pick<TJournalTitle, 'journal_uuid'>[] = await this.journalsTitleRepository.query(
        `SELECT journal_uuid FROM journal_titles WHERE subscription_id = $1`,
        [createJournalPayload.subscription_id]
      );

      let journalTitleUUID: string;

      if (!existingTitle.length) {
        // Insert into journal_titles
        const journalTitleQueryData = insertQueryHelper(createJournalPayload, [
          'barcode',
          'item_type',
          'issn',
          'journal_title',
          'editor_name',
          'created_by',
          'remarks',
          'copy_images',
          'copy_additional_fields',
          'copy_description',
        ]);

        journalTitleQueryData.values = journalTitleQueryData.values.map((val) =>
          Array.isArray(val) || typeof val === 'object' ? JSON.stringify(val) : val
        );

        const inserted = await this.journalsTitleRepository.query(
          `INSERT INTO journal_titles (${journalTitleQueryData.queryCol}) VALUES (${journalTitleQueryData.queryArg}) RETURNING journal_uuid`,
          journalTitleQueryData.values
        );

        journalTitleUUID = inserted[0].journal_uuid;
      } else {
        // Use existing journal_uuid
        journalTitleUUID = existingTitle[0].journal_uuid;

        // Update count in journal_titles
        await this.journalsTitleRepository.query(
          `UPDATE journal_titles SET total_count = total_count + 1, available_count = available_count + 1, updated_at = NOW() WHERE journal_uuid = $1`,
          [journalTitleUUID]
        );
      }

      // Prepare copy insert payload
      const journalCopiesPayloadWithTitleUUID = {
        ...createJournalPayload,
        journal_title_uuid: journalTitleUUID,
      } as TJournalCopy & TJournalTitle;

      const journalCopyQueryData = insertQueryHelper(journalCopiesPayloadWithTitleUUID, [
        'journal_uuid',
        'journal_title_id',
        'category',
        'name_of_publisher',
        'place_of_publication',
        'subscription_id',
        'subscription_start_date',
        'subscription_end_date',
        'volume_no',
        'frequency',
        'issue_number',
        'vendor_name',
        'subscription_price',
        'library_name',
        'classification_number',
        'is_archived',
        'total_count',
        'available_count',
        'created_at',
        'updated_at',
        'title_images',
        'title_additional_fields',
        'title_description',
        'institute_uuid'
      ]);

      journalCopyQueryData.values = journalCopyQueryData.values.map((val) =>
        Array.isArray(val) || typeof val === 'object' ? JSON.stringify(val) : val
      );

      // Insert into journal_copy
      await this.journalsCopyRepository.query(
        `INSERT INTO journal_copy (${journalCopyQueryData.queryCol}) VALUES (${journalCopyQueryData.queryArg})`,
        journalCopyQueryData.values
      );

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Periodical created successfully',
      };
    } catch (error) {
      throw error;
    }
  }



  // async createJournal(createJournalPayload: TCreateJournalZodDTO) {
  //   try {

  //     const data = await this.journalsTitleRepository.query(
  //       `SELECT * FROM journal_titles WHERE subscription_id = $1`,
  //       [createJournalPayload.subscription_id]
  //     )
  //     if (data.length) {
  //       throw new HttpException("Journal With The Same Subsciprtion Id Exists ", HttpStatus.NOT_FOUND)
  //     }

  //     // check if periodical exists in journal title table
  //     let journalTitleUUID: Pick<TJournalTitle, 'journal_uuid'>[] = await this.journalsTitleRepository.query(
  //       `SELECT journal_uuid FROM journal_titles WHERE subscription_id = $1`,
  //       [createJournalPayload.subscription_id]
  //     )

  //     if (!journalTitleUUID.length) {
  //       //Create the required Columns, Arg, and Values
  //       //Ignore the Columns that are used by Copy table
  //       const journalTitleQueryData = insertQueryHelper(createJournalPayload, [
  //         'barcode',
  //         'item_type',
  //         'issn',
  //         'journal_title',
  //         'editor_name',
  //         'institute_uuid',
  //         'created_by',
  //         'remarks',
  //         'copy_images',
  //         'copy_additional_fields',
  //         'copy_description',
  //       ])

  //       //Convert some specific fields to string
  //       journalTitleQueryData.values.forEach((element, idx) => {
  //         if (Array.isArray(element) || typeof element === 'object') {
  //           journalTitleQueryData.values[idx] = JSON.stringify(element);
  //         }
  //       });
  //       journalTitleUUID = await this.journalsTitleRepository.query(
  //         `INSERT INTO journal_titles (${journalTitleQueryData.queryCol}) VALUES (${journalTitleQueryData.queryArg}) RETURNING journal_uuid`,
  //         journalTitleQueryData.values,
  //       );
  //     } else {
  //       await this.journalsTitleRepository.query(
  //         `UPDATE journal_titles SET total_count = total_count + 1, available_count = available_count + 1, updated_at = NOW() WHERE subscription_id = $1`,
  //         [createJournalPayload.subscription_id],
  //       );
  //     }

  //     //Journal Copy Table logic
  //     //This variable also includes journal title payload
  //     const journalCopiesPayloadWithTitleUUID = Object.assign(createJournalPayload, {
  //       //journal_copy_id: journalId,
  //       journal_title_uuid: journalTitleUUID[0].journal_uuid,
  //     }) as TJournalCopy & TJournalTitle;

  //     //Create the required Columns, Arg, and Values
  //     //Ignore the Columns that are used by Title table
  //     const journalCopyQueryData = insertQueryHelper(journalCopiesPayloadWithTitleUUID,
  //       [
  //         'journal_uuid',
  //         'journal_title_id',
  //         'category',
  //         'name_of_publisher',
  //         'place_of_publication',
  //         'subscription_id',
  //         'subscription_start_date',
  //         'subscription_end_date',
  //         'volume_no',
  //         'frequency',
  //         'issue_number',
  //         'vendor_name',
  //         'subscription_price',
  //         'library_name',
  //         'classification_number',
  //         'is_archived',
  //         'total_count',
  //         'available_count',
  //         'created_at',
  //         'updated_at',
  //         'title_images',
  //         'title_additional_fields',
  //         'title_description'
  //       ]
  //     )

  //     //Convert some specific fields to string
  //     journalCopyQueryData.values.forEach((element, idx) => {
  //       if (Array.isArray(element) || typeof element === 'object') {
  //         journalCopyQueryData.values[idx] = JSON.stringify(element);
  //       }
  //     });

  //     await this.journalsCopyRepository.query(
  //       `INSERT INTO journal_copy (${journalCopyQueryData.queryCol}) VALUES (${journalCopyQueryData.queryArg})`,
  //       journalCopyQueryData.values,
  //     );
  //     return { statusCode: HttpStatus.CREATED, message: 'Periodical created' };

  //   } catch (error) {
  //     throw error
  //   }
  // }

  async updatePeriodicalCopy(updatePeriodicalPayload: TUpdatePeriodicalDTO) {
    try {
      let queryData = updateQueryHelper<TUpdatePeriodicalDTO>(
        updatePeriodicalPayload,
        [],
      );

      const periodical = await this.journalsCopyRepository.query(
        `SELECT * FROM journal_copy WHERE journal_copy_id=$1 AND is_archived=false AND is_available=true`,
        [updatePeriodicalPayload.journal_copy_id],
      );
      console.log(periodical);
      if (periodical.length === 0) {
        return { message: 'Periodical Not Found' };
      }
      const result = await this.journalsCopyRepository.query(
        `UPDATE journal_copy SET ${queryData.queryCol} WHERE journal_copy_id=$${queryData.values.length + 1}  AND is_archived=false AND is_available=true`,
        [...queryData.values, updatePeriodicalPayload.journal_copy_id],
      );
      return {
        result: result,
        message: 'Periodical Updated Successfully!',
      };
    } catch (error) {
      throw error;
    }
  }

  // working
  async getArchivedJournals(
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

      const journals = await this.journalsTitleRepository.query(
        `SELECT * FROM journal_titles WHERE is_archived = true AND journal_title ILIKE $1 LIMIT $2 OFFSET $3`,
        [searchQuery, limit, offset],
      );

      const total = await this.journalsTitleRepository.query(
        `SELECT COUNT(*) as count FROM journal_titles WHERE is_archived = true AND journal_title ILIKE $1`,
        [searchQuery],
      );

      return {
        data: journals,
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
        'Error fetching journals',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // working
  async getJournalLogDetails(
    { page, limit }: { page: number; limit: number } = {
      page: 1,
      limit: 10,
    },
  ) {
    try {
      const offset = (page - 1) * limit;

      const journalsTitleLogs = await this.journalLogRepository.query(
        `SELECT * from journal_logs INNER JOIN journal_titles ON journal_titles.journal_uuid = journal_logs.journal_title_uuid LIMIT $1 OFFSET $2`,
        [limit, offset],
      );

      const journalsCopiesLogs = await this.journalLogRepository.query(
        `SELECT * FROM journal_logs INNER JOIN journal_copy ON journal_copy.journal_copy_uuid = journal_logs.journal_copy_uuid;`,
      );

      const studentLogs = await this.journalLogRepository.query(
        `SELECT * FROM journal_logs INNER JOIN students_table ON students_table.student_uuid = journal_logs.borrower_uuid;`,
      );

      const total = await this.journalLogRepository.query(
        `SELECT COUNT(*) as count FROM journal_logs`,
      );

      return {
        data: { journalsTitleLogs, journalsCopiesLogs, studentLogs },
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
        'Error fetching journals',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // working
  async restoreJournal(journal_uuid: string) {
    try {
      const journal = await this.journalsTitleRepository.query(
        `SELECT * FROM journal_titles WHERE journal_uuid = $1 AND is_archived = true`,
        [journal_uuid],
      );

      if (journal.length === 0) {
        throw new HttpException(
          'Periodical not found or already active',
          HttpStatus.NOT_FOUND,
        );
      }

      await this.journalsTitleRepository.query(
        `UPDATE journal_titles SET is_archived = false WHERE journal_uuid = $1`,
        [journal_uuid],
      );

      return { message: 'Periodical restored successfully' };
    } catch (error) {
      throw new HttpException(
        'Error restoring journal',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // working
  async getJournalTitleDetails({
    journal_uuid,
    issn,
    titlename,
  }: {
    journal_uuid: string;
    issn: string;
    titlename: string;
  }) {
    try {
      const queryParams: string[] = [];
      let query = `SELECT * FROM journal_titles WHERE 1=1`;

      if (journal_uuid) {
        query += ` AND journal_uuid = $${queryParams.length + 1}`;
        queryParams.push(journal_uuid);
      }
      if (issn) {
        query += ` AND issn = $${queryParams.length + 1}`;
        queryParams.push(issn);
      }
      if (titlename) {
        query += ` AND book_title ILIKE $${queryParams.length + 1}`;
        queryParams.push(`%${titlename}%`);
      }

      const journal = await this.journalsTitleRepository.query(
        query.concat(' LIMIT 1'),
        queryParams,
      );

      if (journal.length === 0) {
        throw new HttpException('Journal not found', HttpStatus.NOT_FOUND);
      }

      return journal; // Return only the first matching book
    } catch (error) {
      throw new HttpException(
        'Error fetching journal details',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getCopyInformation(
    { journal_copy_id }: { journal_copy_id: string } = { journal_copy_id: '' },
  ) {
    if (!journal_copy_id.length) {
      return { message: 'Enter journal_copy_id' };
    }
    const copy = await this.journalsCopyRepository.query(
      `SELECT * FROM journal_copy WHERE journal_copy_id=$1 AND is_available=true AND is_archived=false`,
      [journal_copy_id],
    );
    if (!copy.length) {
      return { message: 'No Copy Found' };
    } else {
      return copy;
    }
  }

  async getAllCopies({
    page = 1,
    limit = 10,
    search = '',
  }: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    try {
      const offset = (page - 1) * limit;
      const searchQuery = search ? `${search}%` : '%';

      const journals = await this.journalsCopyRepository.query(
        `SELECT * FROM journal_copy WHERE is_archived=false AND is_available=true`,
      );
      const total = await this.journalsTitleRepository.query(
        `SELECT COUNT(*) AS count FROM journal_copy WHERE is_archived=false AND is_available=true`,
      );
      return {
        data: journals,
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
        'Error fetching Journals',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // working
  async findAllJournalCopyInfo({
    journal_copy_id = '',
    journal_title = '',
    editor_name = '',
    issn = '',
    barcode = '',
    item_type = '',
    institute_uuid = '',
    page = 1,
    limit = 10,
    search = '',
  }: {
    journal_copy_id?: string;
    journal_title?: string;
    editor_name?: string;
    issn?: string;
    barcode?: string;
    item_type?: string;
    institute_uuid?: string;
    page?: number;
    limit?: number;
    search?: string;
  }) {
    try {
      const offset = (page - 1) * limit;
      const searchQuery = search ? `${search}%` : '%';

      if (
        !journal_copy_id &&
        !journal_title &&
        !editor_name &&
        !issn &&
        !barcode &&
        !item_type &&
        !institute_uuid
      ) {
        return { message: 'Enter Parameter(s) To Search' };
      }

      const queryParams: string[] = [];
      let query = `SELECT * FROM journal_copy WHERE 1=1`;

      if (journal_title) {
        query += ` AND journal_title = $${queryParams.length + 1}`;
        queryParams.push(journal_title);
      }
      if (editor_name) {
        query += ` AND editor_name = $${queryParams.length + 1}`;
        queryParams.push(editor_name);
      }
      if (issn) {
        query += ` AND issn = $${queryParams.length + 1}`;
        queryParams.push(issn);
      }
      if (barcode) {
        query += ` AND barcode = $${queryParams.length + 1}`;
        queryParams.push(barcode);
      }
      if (item_type) {
        query += ` AND item_type = $${queryParams.length + 1}`;
        queryParams.push(item_type);
      }
      if (institute_uuid) {
        query += ` AND institute_uuid = $${queryParams.length + 1}`;
        queryParams.push(institute_uuid);
      }

      const journal = await this.journalsCopyRepository.query(
        query,
        queryParams,
      );

      console.log(journal);

      if (journal.length === 0) {
        throw new HttpException('Periodical not found', HttpStatus.NOT_FOUND);
      }

      const journals = await this.journalsCopyRepository.query(
        `SELECT * FROM journal_copy WHERE is_archived = false AND is_available=true AND journal_title_uuid = $1 LIMIT $2 OFFSET $3`,
        [journal[0].journal_title_uuid, limit, offset],
      );

      const total = await this.journalsCopyRepository.query(
        `SELECT COUNT(*) as count FROM journal_copy WHERE is_archived = false AND is_available = true AND journal_copy_id ILIKE $1`,
        [searchQuery],
      );

      return {
        data: journals,
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
        'Error fetching journals',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // working

  async getSingleJournalCopyInfo({
    journal_title_id = '',
    page = 1,
    limit = 10,
    search = '',
  }: {
    journal_title_id?: string;
    page?: number;
    limit?: number;
    search?: string;
  }) {
    try {
      if (!journal_title_id) {
        return { message: 'Enter journal_title_id' };
      }
      const offset = (page - 1) * limit;
      const searchQuery = search ? `${search}%` : '%';
      console.log('start');

      const title_data = await this.journalsTitleRepository.query(
        `SELECT * FROM journal_titles WHERE journal_title_id=$1 `,
        [journal_title_id],
      );

      console.log(title_data);

      const copy_data = await this.journalsCopyRepository.query(
        `SELECT * FROM journal_copy WHERE journal_title_uuid=$1`,
        [title_data[0].journal_uuid],
      );

      const total = await this.journalsCopyRepository.query(
        `SELECT COUNT(*) AS count FROM journal_copy WHERE is_archived=false AND is_available=true AND journal_title_uuid = $1`,
        [title_data[0].journal_uuid],
      );

      return {
        data: copy_data,
        pagination: {
          total: parseInt(total[0].count, 10),
          page,
          limit,
          totalPages: Math.ceil(parseInt(total[0].count, 10) / limit),
        },
      };
    } catch (error) {
      return { error: error };
    }
  }

  // async getSingleJournalCopyInfo({
  //     journal_title_uuid = '',
  //     page = 1,
  //     limit = 10,
  //     search = '',
  // }: {
  //     journal_title_uuid?: string,
  //     page?: number;
  //     limit?: number;
  //     search?: string;
  // }) {
  //     try {
  //         if (!journal_title_uuid) {
  //             return { message: "Enter journal_title_uuid" }
  //         }

  //         const offset = (page - 1) * limit;
  //         const searchQuery = search ? `${search}%` : '%';
  //         const periodical_copy = await this.journalsCopyRepository.query(
  //             `SELECT jc.*, jt.journal_title_id
  //             FROM journal_copy jc
  //             JOIN journal_titles jt ON jc.journal_title_uuid = jt.journal_uuid
  //             WHERE jc.journal_title_uuid = $1
  //             AND jc.is_archived = false
  //             AND jc.is_available = true
  //             AND jt.is_archived = false
  //             AND jt.available_count > 0
  //             LIMIT $2 OFFSET $3`,
  //             [journal_title_uuid, limit, offset]
  //         );
  //         if (!periodical_copy.length) {
  //             return { message: "Periodical Does Not Exist" }
  //         }

  //         const total = await this.journalsCopyRepository.query(
  //             `SELECT COUNT(*) AS count FROM journal_copy WHERE is_archived=false AND is_available=true AND journal_title_uuid = $1`,
  //             [journal_title_uuid]
  //         )

  //         return {
  //             data: periodical_copy,
  //             pagination: {
  //                 total: parseInt(total[0].count, 10),
  //                 page,
  //                 limit,
  //                 totalPages: Math.ceil(parseInt(total[0].count, 10) / limit),
  //             },
  //         };
  //     } catch (error) {
  //         throw new HttpException('Error fetching copy', HttpStatus.INTERNAL_SERVER_ERROR);
  //     }
  // }

  // working
  async updateJournalTitle(updateJournalPayload: TUpdateJournalTitleDTO) {
    try {
      let queryData = updateQueryHelper<TUpdateJournalTitleDTO>(
        updateJournalPayload,
        [],
      );
      const journal = await this.journalsTitleRepository.query(
        `SELECT * FROM journal_titles WHERE journal_uuid='${updateJournalPayload.journal_uuid}' AND is_archived=false AND available_count>0`,
      );
      if (journal.length === 0) {
        throw new HttpException('Periodical Not Found', HttpStatus.NOT_FOUND);
      }
      const result = await this.journalsTitleRepository.query(
        `UPDATE journal_titles 
                 SET ${queryData.queryCol}
                 WHERE journal_uuid='${updateJournalPayload.journal_uuid}' AND is_archived=false AND available_count>0`,
        queryData.values,
      );

      return {
        message: `Periodical Updated Successfully!`,
      };
    } catch (error) {
      throw error;
    }
  }

  // working
  async archivePeriodicalCopy(journal_copy_id: string) {
    try {
      // Archive the book copy and get the bookTitleUUID
      const archiveResult = await this.journalsCopyRepository.query(
        `UPDATE journal_copy SET is_archived = true WHERE journal_copy_id = $1 RETURNING journal_title_uuid`,
        [journal_copy_id],
      );

      if (archiveResult.length === 0) {
        throw new Error('Periodical copy not found or already archived');
      }

      const journalTitleUUID = archiveResult[0][0].journal_title_uuid;

      console.log({ journalTitleUUID });

      // Reduce total_count and available_count in book_titles
      await this.journalsTitleRepository.query(
        `UPDATE journal_titles SET total_count = GREATEST(total_count - 1, 0), available_count = GREATEST(available_count - 1, 0)WHERE journal_uuid = $1`,
        [journalTitleUUID],
      );

      return {
        success: true,
        message: 'Periodical copy archived successfully',
      };
    } catch (error) {
      throw new Error('Failed to archive Periodical copy');
    }
  }

  // working
  async getArchivedJournalsCopy(
    { page, limit }: { page: number; limit: number } = {
      page: 1,
      limit: 10,
    },
  ) {
    try {
      const offset = (page - 1) * limit;

      const journals = await this.journalsCopyRepository.query(
        `SELECT * FROM journal_copy WHERE is_archived = true LIMIT $1 OFFSET $2`,
        [limit, offset],
      );

      const total = await this.journalsCopyRepository.query(
        `SELECT COUNT(*) as count FROM journal_copy WHERE is_archived = true`,
      );

      return {
        data: journals,
        total: total.count,
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
        'Error fetching journals',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // working
  async restorePeriodicalCopy(journal_copy_id: string) {
    try {
      const journal = await this.journalsCopyRepository.query(
        `SELECT * FROM journal_copy WHERE journal_copy_id = $1 AND is_archived = true`,
        [journal_copy_id],
      );

      if (journal.length === 0) {
        throw new HttpException(
          'Journal not found or already active',
          HttpStatus.NOT_FOUND,
        );
      }

      await this.journalsTitleRepository.query(
        `UPDATE journal_copy SET is_archived = false WHERE journal_copy_id = $1 RETURNING journal_title_uuid`,
        [journal_copy_id],
      );

      const journalTitleUUID = journal[0].journal_title_uuid;

      await this.journalsTitleRepository.query(
        `UPDATE journal_titles SET total_count = total_count + 1, available_count = available_count + 1 WHERE journal_uuid = $1`,
        [journalTitleUUID],
      );

      return { message: 'Journal restored successfully' };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Error restoring journal',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateJournalCopy(id: string, updateJournalCopyPayload: any) {
    try {
      const journalCopy = await this.journalsCopyRepository.query(
        `SELECT * FROM journal_copy WHERE journal_copy_uuid = $1 LIMIT 1`,
        [id],
      );

      console.log({ journalCopy });

      if (!journalCopy || journalCopy.length === 0) {
        throw new HttpException('Journal copy not found', HttpStatus.NOT_FOUND);
      }

      await this.journalsCopyRepository.query(
        `UPDATE journal_copy
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
          updateJournalCopyPayload.source_of_acquisition,
          updateJournalCopyPayload.date_of_acquisition,
          updateJournalCopyPayload.bill_no,
          updateJournalCopyPayload.language,
          updateJournalCopyPayload.inventory_number,
          updateJournalCopyPayload.accession_number,
          updateJournalCopyPayload.barcode,
          updateJournalCopyPayload.item_type,
          updateJournalCopyPayload.remarks,
          updateJournalCopyPayload.copy_images,
          updateJournalCopyPayload.copy_additional_fields,
          updateJournalCopyPayload.copy_description,
        ],
      );

      return { message: 'Journal copy updated successfully' };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Error updating journal copy',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async bulkDeletePeriodicalCopies(arrCopyUUIDPayload: TPeriodicalCopyIdDTO[]) {
    try {
      const zodValidatedBatchArr: TPeriodicalCopyIdDTO[][] =
        Chunkify(arrCopyUUIDPayload);
      const BatchArr: Promise<TPeriodicalCopyIdDTO[]>[] = [];
      for (let i = 0; i < zodValidatedBatchArr.length; i++) {
        let result = CreateWorker<TPeriodicalCopyIdDTO[]>(
          zodValidatedBatchArr[i],
          'journals/bulk-delete-for-periodicals-copies',
        );
        BatchArr.push(result);
      }
      const arrayOfUnableToArchive = (await Promise.all(BatchArr)).flat();
      return arrayOfUnableToArchive;
    } catch (error) {
      throw error;
    }
  }

  // ISSUE PERIODICALS NEW FUNCTIONS

  async borrow(
    issuePayload: Omit<TIssueLogDTO, 'action'>,
    request: Request,
    status: 'borrowed' | 'in_library_borrowed' | 'returned',
    category,
  ) {
    try {
      if (!request.ip) {
        throw new HttpException(
          'Unable to get IP address of the Student',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return await this.dataSource.transaction(
        async (transactionalEntityManager) => {
          // Check if student exists
          const studentExists = await transactionalEntityManager.query(
            `SELECT * FROM students_table WHERE student_id = $1`,
            [issuePayload.student_id],
          );
          if (studentExists.length === 0) {
            throw new HttpException(
              'Invalid Student ID',
              HttpStatus.BAD_REQUEST,
            );
          }

          const student_uuid = studentExists[0].student_uuid;
          const journal_copy_id = issuePayload.copy_id;

          // Check if journal exists and is available
          const journalData = await transactionalEntityManager.query(
            `SELECT * FROM journal_copy WHERE journal_copy_id=$1 AND is_archived=false ${status === 'borrowed' ? 'AND is_available=true' : 'AND is_available=false'}`,
            [issuePayload.copy_id],
          );
          if (journalData.length === 0) {
            throw new HttpException(
              status === 'borrowed'
                ? 'Journal Copy is not available'
                : 'Periodical not issued or does not exist',
              HttpStatus.BAD_REQUEST,
            );
          }

          const journal_copy_uuid = journalData[0].journal_copy_uuid;
          const journal_title_uuid = journalData[0].journal_title_uuid;

          // Check if journal exists in the title table
          const journalTitle = await transactionalEntityManager.query(
            `SELECT * FROM journal_titles WHERE journal_uuid=$1 AND is_archived=false`,
            [journal_title_uuid],
          );
          if (journalTitle.length === 0) {
            throw new HttpException(
              'Periodical title not found or archived',
              HttpStatus.BAD_REQUEST,
            );
          }

          let updatedTitle: any = null;
          let updatedCopy: any = null;

          // Borrowed Logic
          if (status === 'borrowed' || status === 'in_library_borrowed') {
            if (journalTitle[0].available_count <= 0) {
              throw new HttpException(
                'No available periodicals for borrowing',
                HttpStatus.BAD_REQUEST,
              );
            }

            updatedTitle = await transactionalEntityManager.query(
              `UPDATE journal_titles SET available_count=available_count-1 WHERE journal_uuid=$1 AND available_count>0 RETURNING *`,
              [journal_title_uuid],
            );
            if (updatedTitle.length === 0) {
              throw new HttpException(
                'Failed to update available count',
                HttpStatus.INTERNAL_SERVER_ERROR,
              );
            }

            updatedCopy = await transactionalEntityManager.query(
              `UPDATE journal_copy SET is_available=false WHERE journal_copy_id=$1 RETURNING *`,
              [journal_copy_id],
            );

            const return_date = new Date();
            return_date.setDate(return_date.getDate() + 7);

            await this.feesPenaltiesRepository.query(
              `INSERT INTO fees_penalties (category, borrower_uuid, copy_uuid, return_date) VALUES ($1, $2, $3, $4)`,
              [category, student_uuid, journal_copy_uuid, return_date],
            );
          } // Returned Logic - need to get the existing fp_uuid for existingBorrow so that every record with the same copy_id does not get updated
          else if (status === 'returned') {
            // Check if the journal was actually borrowed before returning
            const existingBorrow = await this.journalLogRepository.query(
              `SELECT * FROM fees_penalties WHERE copy_uuid=$1`,
              [journal_copy_uuid],
            );
            if (existingBorrow.length === 0) {
              throw new HttpException(
                'This journal was not borrowed before',
                HttpStatus.BAD_REQUEST,
              );
            }
            if (
              journalTitle[0].available_count >= journalTitle[0].total_count
            ) {
              throw new HttpException(
                'Cannot return periodical. Available count already at maximum.',
                HttpStatus.BAD_REQUEST,
              );
            }

            updatedTitle = await transactionalEntityManager.query(
              `UPDATE journal_titles SET available_count=available_count+1 WHERE journal_uuid=$1 RETURNING *`,
              [journal_title_uuid],
            );
            updatedCopy = await transactionalEntityManager.query(
              `UPDATE journal_copy SET is_available=true WHERE journal_copy_id=$1 RETURNING *`,
              [journal_copy_id],
            );

            let returnRecord = await this.journalLogRepository.query(
              `SELECT return_date FROM fees_penalties WHERE copy_uuid=$1`,
              [journal_copy_uuid],
            );

            if (returnRecord.length > 0) {
              const return_date = new Date(returnRecord[0].return_date);
              const today = new Date();
              let delayed_days = differenceInDays(
                startOfDay(return_date),
                startOfDay(today),
              );
              delayed_days = delayed_days > 0 ? 0 : delayed_days;
              const penalty_amount = delayed_days < 0 ? delayed_days * 50 : 0;
              const is_penalised = delayed_days < 0 ? true : false;
              console.log(is_penalised);

              await this.feesPenaltiesRepository.query(
                `UPDATE fees_penalties SET days_delayed=$1, penalty_amount=$2, is_penalised=$3, returned_at=$4 WHERE copy_uuid=$5 RETURNING *`,
                [
                  delayed_days,
                  penalty_amount,
                  is_penalised,
                  today,
                  journal_copy_uuid,
                ],
              );
            }
          }

          if (!updatedCopy || !updatedTitle) {
            throw new HttpException(
              'Failed to update journal records',
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }

          await transactionalEntityManager.query(
            `INSERT INTO journal_logs 
              (old_journal_copy, new_journal_copy, old_journal_title, new_journal_title, 
              action, description, issn, ip_address, borrower_uuid, journal_title_uuid, journal_copy_uuid)  
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
            [
              JSON.stringify(journalData[0]),
              JSON.stringify(updatedCopy[0]),
              JSON.stringify(journalTitle[0]),
              JSON.stringify(updatedTitle[0]),
              status,
              status === 'borrowed'
                ? 'Periodical has been borrowed'
                : 'Periodical has been returned',
              journalData[0].issn,
              request.ip,
              student_uuid,
              journal_title_uuid,
              journal_copy_uuid,
            ],
          );

          return {
            message: `Periodical ${status === 'borrowed' ? 'Borrowed' : 'Returned'} Successfully`,
            statusCode:
              status === 'borrowed' ? HttpStatus.CREATED : HttpStatus.OK,
          };
        },
      );
    } catch (error) {
      return { error: error.message };
    }
  }

  async return(
    issuePayload: Omit<TIssueLogDTO, 'action'>,
    request: Request,
    status: 'borrowed' | 'in_library_borrowed',
    category,
  ) {
    return `${category} Returned`;
  }
}
