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
import { LibraryConfig } from 'src/config/entity/library_config.entity';

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

    @InjectRepository(LibraryConfig)
    private libraryConfigRepository: Repository<LibraryConfig>,

    private readonly dataSource: DataSource,
  ) { }

// Get Books and Journals by Institute UUIDs
async getBooksAndJournals(instituteUUIDs: string[], search: string, page: number, limit: number) {
  const offset = (page - 1) * limit;
  const data = await this.journalsTitleRepository.query(
    `
      SELECT
        COALESCE(jt.institute_uuid, b.institute_id) AS institute_uuid,
        COALESCE(jt.name_of_publisher, b.name_of_publisher) AS publisher,
        COALESCE(jt.total_count, b.total_count) AS total_count,
        COALESCE(jt.available_count, b.available_count) AS available_count,
        COALESCE(jt.is_archived, b.is_archived) AS is_archived,

        -- Journal-specific fields (from journal_titles only)
        jt.journal_title_id AS item_id,
        jt.category,
        jt.subscription_id,
        jt.subscription_start_date,
        jt.subscription_end_date,
        jt.volume_no AS volume_number,
        jt.frequency,
        jt.issue_number,
        jt.vendor_name,
        jt.subscription_price,
        jt.library_name,
        jt.classification_number,
        jt.created_at AS journal_created_at,
        jt.updated_at AS journal_updated_at,
        jt.title_images,
        jt.title_description,
        jt.title_additional_fields,

        -- Book-specific fields
        b.book_title,
        b.book_author,
        b.year_of_publication,
        b.language,
        b.edition,
        b.isbn,
        b.no_of_pages,
        b.no_of_preliminary_pages,
        b.subject,
        b.department,
        b.call_number,
        b.author_mark,
        b.source_of_acquisition,
        b.date_of_acquisition,
        b.bill_no,
        b.inventory_number,
        b.accession_number,
        b.barcode,
        b.item_type,

        -- Type indicator
        CASE 
          WHEN jt.journal_uuid IS NOT NULL THEN 'journal'
          WHEN b.book_uuid IS NOT NULL THEN 'book'
        END AS item_type

      FROM journal_titles jt
      FULL OUTER JOIN books_table b ON b.institute_id = jt.institute_uuid
      WHERE COALESCE(jt.institute_uuid, b.institute_id) = ANY($1)
        AND (
          $2::text IS NULL 
          OR jt.title_description ILIKE '%' || $2 || '%' 
          OR b.book_title ILIKE '%' || $2 || '%'
        )
      LIMIT $3 OFFSET $4
    `,
    [instituteUUIDs, search || null, limit, offset]
  );

  if (data.length === 0) {
    return { message: "Nothing found" };
  } else {
    return data;
  }
}
  // ----- BOTH TABLE SIMULTAENOUS FUNCTIONS -----

  // working
  async getJournals(
    {
      page,
      limit,
      search,
      institute_uuid
    }: {
      page: number;
      limit: number;
      search: string;
      institute_uuid: string;
    }
  ) {
    try {
      const offset = (page - 1) * limit;
      const searchQuery = search ? `%${search}%` : '%';
      const institutes = [institute_uuid];
  
      const journals = await this.journalsTitleRepository.query(
        `
        SELECT journal_title_id, name_of_publisher, total_count, volume_no, subscription_start_date, subscription_end_date 
        FROM journal_titles 
        WHERE available_count > 0 
          AND is_archived = false 
          AND institute_uuid = ANY($1)
          AND name_of_publisher ILIKE $2
        LIMIT $3 OFFSET $4
        `,
        [institutes, searchQuery, limit, offset]
      );
  
      const total = await this.journalsTitleRepository.query(
        `
        SELECT COUNT(*) AS count 
        FROM journal_titles 
        WHERE available_count > 0 
          AND is_archived = false 
          AND institute_uuid = ANY($1)
          AND name_of_publisher ILIKE $2
        `,
        [institutes, searchQuery]
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
      console.error('Error fetching Journals:', error);
      throw new HttpException(
        error.message || 'Error fetching Journals',
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

       
        // 8. Insert Into The Fees-n-Penalties Table
        const penaltyData = await this.feesPenaltiesRepository.query(
          `SELECT * FROM fees_penalties WHERE copy_uuid=$1`,
          [journal_copy_uuid],
        );

        if (penaltyData.length === 0) {
          throw new HttpException(
            'Record not found for penalty calculation',
            HttpStatus.BAD_REQUEST,
          );
        }

        // Extract return date
        const return_date = new Date(penaltyData[0].return_date);
        const returned_date = new Date(); // today

        // Calculate delayed days correctly
        let delayed_days = differenceInDays(returned_date, return_date);
        delayed_days = delayed_days < 0 ? 0 : delayed_days; // Ensure non-negative

        const max_fees_per_day = penaltyData[0].late_fees_per_day
        // Calculate penalty
        const penalty_amount = delayed_days > 0 ? delayed_days * max_fees_per_day : 0;
        const is_penalised = delayed_days > 0;
        const is_completed = penalty_amount > penaltyData[0].paid_amount

        const fp_uuid = penaltyData[0].fp_uuid
        console.log("fp_uuid : ", fp_uuid)

        // Update penalty table
        await this.feesPenaltiesRepository.query(
          `UPDATE fees_penalties 
          SET days_delayed=$1, penalty_amount=$2, is_penalised=$3, returned_at=$4, is_completed=$5 WHERE copy_uuid=$6 RETURNING *`,
          [
            delayed_days,
            penalty_amount,
            is_penalised,
            returned_date,
            is_completed,
            journal_copy_uuid,
          ],
        );


         // 7. Insert Log Entry
         await transactionalEntityManager.query(
          `INSERT INTO journal_logs 
            (old_journal_copy, new_journal_copy, old_journal_title, new_journal_title, 
            action, description, issn, ip_address, borrower_uuid, journal_title_uuid, journal_copy_uuid, fp_uuid)  
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
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
            fp_uuid
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


  // use for the issue route
  async periodicalBorrowed(
    journalLogPayload: Omit<TCreateJournalLogDTO, 'action'>,
    request: Request,
    status: 'borrowed' | 'in_library_borrowed',
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

        // calculate the return date hence fetch the late_fees_per_day, max_days
        let institute_uuid = await this.journalsTitleRepository.query(
          `SELECT jt.institute_uuid
           FROM journal_titles jt
           WHERE jt.journal_uuid = (
             SELECT jc.journal_title_uuid
             FROM journal_copy jc
             WHERE jc.journal_copy_id = $1
           )`,
          [journalLogPayload.copy_id]
        );
              
        institute_uuid = institute_uuid[0].institute_uuid

        const data = await this.libraryConfigRepository.query(
          `SELECT max_days FROM library_config WHERE institute_uuid = $1`,
          [institute_uuid]
        )
        
        const max_days = data[0].max_days
        let return_date = new Date()
        return_date.setDate(return_date.getDate() + max_days);
        console.log(return_date)

        // let return_date = new Date();
        // return_date.setDate(return_date.getDate() + 7);
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
