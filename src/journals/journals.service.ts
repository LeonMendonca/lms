// import { journalCopyQueryValidator } from './validators/journalcopy.query-validator';
import { HttpException, HttpStatus, Injectable, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { JournalCopy, TJournalCopy } from './entity/journals_copy.entity';
import { JournalTitle, TJournalTitle } from './entity/journals_title.entity';
import { JournalLogs, TJournalLogs } from './entity/journals_log.entity';
import { TCreateJournalZodDTO } from './zod-validation/createjournaldto-zod';
import { genJournalId } from './id-generation/create-journal-id';
import { insertQueryHelper, updateQueryHelper } from 'src/misc/custom-query-helper';
import { TUpdateJournalTitleDTO, updateJournalSchema } from './zod-validation/updatejournaldto';
import { Students } from 'src/students/students.entity';
import { TCreateJournalLogDTO } from './zod-validation/create-journallog-zod';
import { Request } from 'express';
import { title } from 'process';

@Injectable()
export class JournalsService {
    constructor(
        @InjectRepository(JournalLogs)
        private journalLogRepository: Repository<JournalLogs>,

        @InjectRepository(JournalCopy)
        private journalsCopyRepository: Repository<JournalCopy>,

        @InjectRepository(JournalTitle)
        private journalsTitleRepository: Repository<JournalTitle>,

        @InjectRepository(Students)
        private studentsRepository: Repository<Students>,

        private readonly dataSource: DataSource
    ) { }

    // ----- BOTH TABLE SIMULTAENOUSE FUNCTIONS -----

    // working
    async getJournals(
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

            const books = await this.journalsTitleRepository.query(
                `SELECT * FROM journal_titles WHERE journal_title LIKE $1 AND is_archived = false LIMIT $2 OFFSET $3;`,
                [searchQuery, limit, offset]
            );
            const total = await this.journalsTitleRepository.query(
                `SELECT COUNT(*) as count FROM journal_titles WHERE is_archived = false AND journal_title ILIKE $1`,
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
                'Error fetching Journals',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async getJournalsByID({
        page,
        limit,
        search,
        journal_title_id
    }: { page: number; limit: number; search: string; journal_title_id: string }) {
        try {
            if (!journal_title_id) {
                return { message: "Journal Title ID Not Found" }
            }
            // check if the journal_id exists in the db or not 
            const journals = await this.journalsTitleRepository.query(
                `SELECT * FROM journal_titles WHERE journal_title_id=$1`, [journal_title_id]
            )

            if (journals.length) {
                return { journals: journals }
            } else {
                return { message: "No Journal With The journal_title_id Found" }
            }
        } catch (error) {
            return { error }
        }
    }


    // working
    async searchPeriodicals({
        journal_uuid = '',
        journal_title_id = '',
        journal_title = '',
        editor_name = '',
        name_of_publisher = '',
        issn = '',
        frequency = '',
        issue_number = '',
        vendor_name = '',
        library_name = '',
        classification_number = '',
        // barcode = '',
        // item_type = '',
        // institute_uuid = '',
        page = 1,
        limit = 10,
        search = '',
    }: {
        journal_uuid?: string;
        journal_title_id?: string,
        journal_title?: string;
        editor_name?: string,
        name_of_publisher?: string,
        issn?: string;
        frequency?: string;
        issue_number?: string;
        vendor_name?: string;
        library_name?: string;
        classification_number?: string;
        // barcode?: string;
        // item_type?: string;
        // institute_uuid?: string;
        page?: number;
        limit?: number;
        search?: string;
    }) {
        try {
            const offset = (page - 1) * limit;
            const searchQuery = search ? `${search}%` : '%';

            if (!journal_uuid && !journal_title_id && !journal_title && !editor_name && !name_of_publisher && !issn && !frequency && !issue_number && !vendor_name && !library_name && !classification_number
                // && !barcode && !item_type && !institute_uuid
            ) {
                return { message: "Enter Parameter(s) To Search" }
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
            if (journal_title) {
                query += ` AND journal_title LIKE $${queryParams.length + 1}`;
                queryParams.push(`${journal_title}%`);
            }
            if (editor_name) {
                query += ` AND editor_name LIKE $${queryParams.length + 1}`;
                queryParams.push(`${editor_name}%`);
            }
            if (name_of_publisher) {
                query += ` AND name_of_publisher LIKE $${queryParams.length + 1}`;
                queryParams.push(`${name_of_publisher}%`);
            }
            if (issn) {
                query += ` AND issn = $${queryParams.length + 1}`;
                queryParams.push(issn);
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

            // if (barcode) {
            //     query += ` AND barcode = $${queryParams.length + 1}`;
            //     queryParams.push(barcode);
            // }
            // if (item_type) {
            //     query += ` AND item_type = $${queryParams.length + 1}`;
            //     queryParams.push(item_type);
            // }
            // if (institute_uuid) {
            //     query += ` AND institute_uuid = $${queryParams.length + 1}`;
            //     queryParams.push(institute_uuid);
            // }

            const journal = await this.journalsTitleRepository.query(query, queryParams);
            if (journal.length === 0) {
                throw new HttpException('Journal not found', HttpStatus.NOT_FOUND);
            }

            const journals = await this.journalsCopyRepository.query(
                `SELECT * FROM journal_copy WHERE is_archived = false AND journal_title_uuid = $1`,
                [journal[0].journal_uuid],
            );

            const total = await this.journalsTitleRepository.query(
                `SELECT COUNT(*) as count FROM journal_titles WHERE is_archived = false AND journal_title ILIKE $1`,
                [searchQuery],
            );

            return {
                data: journal,
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
        { issn, page, limit, search }: { issn: string; page: number; limit: number; search: string } = {
            issn: '',
            page: 1,
            limit: 10,
            search: ''
        },
    ) {
        try {
            const offset = (page - 1) * limit;

            const journals = await this.journalsCopyRepository.query(
                `SELECT * FROM journal_copy WHERE is_archived = false AND is_available = true LIMIT $1 OFFSET $2`,
                [limit, offset],
            );

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

    async journalReturned(
        journalLogPayload: Omit<TCreateJournalLogDTO, 'action'>,
        request: Request,
        status: 'returned'
    ) {
        try {
            if (!request.ip) {
                throw new HttpException("Unable to get IP address of the Client", HttpStatus.INTERNAL_SERVER_ERROR);
            }

            // 1. Validate Student ID Exists
            const studentExists: { student_uuid: string }[] = await this.studentsRepository.query(
                `SELECT student_uuid FROM students_table WHERE student_id = $1`,
                [journalLogPayload.student_id]
            );

            if (!studentExists.length) {
                throw new HttpException('Cannot find Student ID', HttpStatus.NOT_FOUND);
            }

            // 2. Check if Borrowed Journal Exists in Copies
            const journalPayloadFromJournalCopies: TJournalCopy[] = await this.journalsCopyRepository.query(
                `SELECT * FROM journal_copy WHERE journal_copy_id = $1 AND barcode = $2 AND is_available = FALSE`,
                [journalLogPayload.journal_copy_id, journalLogPayload.barcode]
            );

            if (!journalPayloadFromJournalCopies.length) {
                throw new HttpException("Cannot find Borrowed Journal", HttpStatus.NOT_FOUND);
            }

            // 3. Verify Student Actually Borrowed This Journal
            const journalBorrowedPayload: TJournalLogs[] = await this.journalLogRepository.query(
                `SELECT * FROM journal_logs WHERE borrower_uuid = $1 AND journal_copy_uuid = $2 AND action = 'borrowed'`,
                [studentExists[0].student_uuid, journalPayloadFromJournalCopies[0].journal_copy_uuid]
            );

            if (!journalBorrowedPayload.length) {
                throw new HttpException('Student hasn\'t borrowed this journal, or an invalid journal is being returned', HttpStatus.NOT_FOUND);
            }

            // 4. Check if Journal Title Exists & Not Fully Returned
            const journalPayloadFromJournalTitle: TJournalTitle[] = await this.journalsTitleRepository.query(
                `SELECT * FROM journal_titles WHERE journal_uuid = $1 AND available_count != total_count`,
                [journalPayloadFromJournalCopies[0].journal_title_uuid]
            );

            if (!journalPayloadFromJournalTitle.length) {
                throw new HttpException("Journal appears to be fully returned in Titles, but exists in Logs as not returned", HttpStatus.INTERNAL_SERVER_ERROR);
            }

            // Get ISSN from Journal Titles
            const issn = journalPayloadFromJournalTitle[0].issn;
            if (!issn) {
                throw new HttpException("ISSN not found for the journal title", HttpStatus.INTERNAL_SERVER_ERROR);
            }

            // 5. Update Journal Copy - Set is_available to TRUE
            const updatedJournalCopiesPayload: [TJournalCopy[], 0 | 1] = await this.journalsCopyRepository.query(
                `UPDATE journal_copy SET is_available = TRUE WHERE journal_copy_uuid = $1 AND barcode = $2 AND is_available = FALSE RETURNING *`,
                [journalPayloadFromJournalCopies[0].journal_copy_uuid, journalPayloadFromJournalCopies[0].barcode]
            );

            if (!updatedJournalCopiesPayload[1]) {
                throw new HttpException("Failed to update Journal", HttpStatus.INTERNAL_SERVER_ERROR);
            }

            if (!updatedJournalCopiesPayload[0].length) {
                throw new HttpException("Something went wrong", HttpStatus.INTERNAL_SERVER_ERROR);
            }

            const journalTitleUUID = updatedJournalCopiesPayload[0][0].journal_title_uuid;
            const journalCopyUUID = updatedJournalCopiesPayload[0][0].journal_copy_uuid;

            // 6. Update Journal Title - Increase Available Count
            const updatedJournalTitlePayload: [TJournalTitle[], 0 | 1] = await this.journalsTitleRepository.query(
                `UPDATE journal_titles SET available_count = available_count + 1 WHERE journal_uuid = $1 RETURNING *`,
                [journalTitleUUID]
            );

            // 7. Convert Old & New Data to JSON
            const oldJournalCopy = JSON.stringify(journalPayloadFromJournalCopies[0]);
            const newJournalCopy = JSON.stringify(updatedJournalCopiesPayload[0][0]);

            const oldJournalTitle = JSON.stringify(journalPayloadFromJournalTitle[0]);
            const newJournalTitle = JSON.stringify(updatedJournalTitlePayload[0][0]);

            // 8. Insert Log into journal_logs (Including ISSN)
            await this.journalLogRepository.query(
                `INSERT INTO journal_logs (
                borrower_uuid, journal_copy_uuid, action, description, 
                journal_title_uuid, issn, old_journal_copy, new_journal_copy, 
                old_journal_title, new_journal_title, ip_address
            ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
                [
                    studentExists[0].student_uuid,
                    journalCopyUUID,
                    status,
                    'Journal has been returned',
                    journalTitleUUID,
                    issn,  // Now included
                    oldJournalCopy,
                    newJournalCopy,
                    oldJournalTitle,
                    newJournalTitle,
                    request.ip
                ]
            );

            return { statusCode: HttpStatus.CREATED, message: "Journal returned successfully" };
        } catch (error) {
            throw error;
        }
    }


    // async journalBorrowed(
    //     journalLogPayload: Omit<TCreateJournalLogDTO, 'action'>,
    //     request: Request,
    //     status: 'borrowed' | 'in_library_borrowed'
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

    //         //Check if Book exists in Book Copies
    //         //Insert into old_book_copy COLUMN
    //         const journalPayloadFromJournalCopies: TJournalCopy[] = await this.journalsCopyRepository.query
    //             (
    //                 `SELECT * FROM journal_copy WHERE journal_copy_id = $1 AND barcode = $2 AND is_available = TRUE`,
    //                 [journalLogPayload.journal_copy_id, journalLogPayload.barcode]
    //             );

    //         if (!journalPayloadFromJournalCopies.length) {
    //             console.log(journalPayloadFromJournalCopies)
    //             throw new HttpException("Cannot find Journal", HttpStatus.NOT_FOUND);
    //         }


    //         //Check if Book exists in Book Titles through book_title_uuid received from Book Copies via SELECT query
    //         //Also make sure it's available
    //         //Insert into old_book_title COLUMN
    //         const journalPayloadFromJournalTitle: TJournalTitle[] = await this.journalsCopyRepository.query
    //             (
    //                 `SELECT * FROM journal_titles WHERE journal_uuid = $1 AND available_count > 0`,
    //                 [journalPayloadFromJournalCopies[0].journal_title_uuid]
    //             )

    //         if (!journalPayloadFromJournalTitle.length) {
    //             throw new HttpException("Journal doesn't seems to be available in Journal Titles, but exists in Journal Copies", HttpStatus.INTERNAL_SERVER_ERROR);
    //         }

    //         //UPDATING now is safe
    //         //Insert into new_book_copy
    //         const updatedJournalCopiesPayload: [TJournalCopy[], 0 | 1] = await this.journalsCopyRepository.query
    //             (
    //                 `UPDATE journal_copy SET is_available = FALSE WHERE journal_copy_uuid = $1 AND barcode = $2 AND is_available = TRUE RETURNING *`,
    //                 [journalPayloadFromJournalCopies[0].journal_copy_uuid, journalPayloadFromJournalCopies[0].barcode],
    //             );

    //         const updateStatus = updatedJournalCopiesPayload[1];
    //         if (!updateStatus) {
    //             //if somehow the update fails, even after getting the data through SELECT query 
    //             throw new HttpException("Failed To Update Journal", HttpStatus.INTERNAL_SERVER_ERROR);
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
    //                 `UPDATE journal_titles SET available_count = available_count - 1 WHERE journal_uuid = $1 RETURNING *`,
    //                 [journalTitleUUID]
    //             );

    //         const oldJournalCopy = JSON.stringify(journalPayloadFromJournalCopies[0]);
    //         const newJournalCopy = JSON.stringify(updatedJournalCopiesPayload[0][0]);

    //         const oldJournalTitle = JSON.stringify(journalPayloadFromJournalTitle[0]);
    //         const newJournalTitle = JSON.stringify(updatedJournalTitlePayload[0][0]);


    //         await this.journalLogRepository.query
    //             (
    //                 `INSERT INTO journal_logs (borrower_uuid, journal_copy_uuid, action, description, journal_title_uuid, old_journal_copy, new_journal_copy,  old_journal_title, new_journal_title, ip_address) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    //                 [
    //                     studentExists[0].student_uuid, journalCopyUUID, status, 'Journal Has Been Borrowed', journalTitleUUID,
    //                     oldJournalCopy, newJournalCopy, oldJournalTitle, newJournalTitle, request.ip
    //                 ]
    //             );

    //         return { statusCode: HttpStatus.CREATED, message: 'Journal borrowed successfully' };
    //     } catch (error) {
    //         throw error;
    //     }
    // }

    async journalBorrowed(
        journalLogPayload: Omit<TCreateJournalLogDTO, 'action'>,
        request: Request,
        status: 'borrowed' | 'in_library_borrowed'
    ) {
        try {
            if (!request.ip) {
                throw new HttpException("Unable to get IP address of the Client", HttpStatus.INTERNAL_SERVER_ERROR);
            }

            // 1. Validate Student ID Exists
            const studentExists: { student_uuid: string }[] = await this.studentsRepository.query(
                `SELECT student_uuid FROM students_table WHERE student_id = $1`,
                [journalLogPayload.student_id]
            );

            if (!studentExists.length) {
                throw new HttpException('Cannot find Student ID', HttpStatus.NOT_FOUND);
            }

            // 2. Check if Journal Exists in Copies
            const journalPayloadFromJournalCopies: TJournalCopy[] = await this.journalsCopyRepository.query(
                `SELECT * FROM journal_copy WHERE journal_copy_id = $1 AND barcode = $2 AND is_available = TRUE`,
                [journalLogPayload.journal_copy_id, journalLogPayload.barcode]
            );

            if (!journalPayloadFromJournalCopies.length) {
                throw new HttpException("Cannot find Journal", HttpStatus.NOT_FOUND);
            }

            // 3. Check if Journal Exists in Titles & Get ISSN
            const journalPayloadFromJournalTitle: TJournalTitle[] = await this.journalsTitleRepository.query(
                `SELECT * FROM journal_titles WHERE journal_uuid = $1 AND available_count > 0`,
                [journalPayloadFromJournalCopies[0].journal_title_uuid]
            );

            if (!journalPayloadFromJournalTitle.length) {
                throw new HttpException("Journal doesn't seem to be available in Journal Titles, but exists in Journal Copies", HttpStatus.INTERNAL_SERVER_ERROR);
            }

            // Get ISSN from Journal Titles
            const issn = journalPayloadFromJournalTitle[0].issn;
            if (!issn) {
                throw new HttpException("ISSN not found for the journal title", HttpStatus.INTERNAL_SERVER_ERROR);
            }

            // 4. Update Journal Copy - Set is_available to FALSE
            const updatedJournalCopiesPayload: [TJournalCopy[], 0 | 1] = await this.journalsCopyRepository.query(
                `UPDATE journal_copy SET is_available = FALSE WHERE journal_copy_uuid = $1 AND barcode = $2 AND is_available = TRUE RETURNING *`,
                [journalPayloadFromJournalCopies[0].journal_copy_uuid, journalPayloadFromJournalCopies[0].barcode]
            );

            if (!updatedJournalCopiesPayload[1]) {
                throw new HttpException("Failed To Update Journal", HttpStatus.INTERNAL_SERVER_ERROR);
            }

            if (!updatedJournalCopiesPayload[0].length) {
                throw new HttpException("Something went wrong", HttpStatus.INTERNAL_SERVER_ERROR);
            }

            const journalTitleUUID = updatedJournalCopiesPayload[0][0].journal_title_uuid;
            const journalCopyUUID = updatedJournalCopiesPayload[0][0].journal_copy_uuid;

            // 5. Update Journal Title - Decrease Available Count
            const updatedJournalTitlePayload: [TJournalTitle[], 0 | 1] = await this.journalsTitleRepository.query(
                `UPDATE journal_titles SET available_count = available_count - 1 WHERE journal_uuid = $1 RETURNING *`,
                [journalTitleUUID]
            );

            // 6. Convert Old & New Data to JSON
            const oldJournalCopy = JSON.stringify(journalPayloadFromJournalCopies[0]);
            const newJournalCopy = JSON.stringify(updatedJournalCopiesPayload[0][0]);

            const oldJournalTitle = JSON.stringify(journalPayloadFromJournalTitle[0]);
            const newJournalTitle = JSON.stringify(updatedJournalTitlePayload[0][0]);

            // 7. Insert Log into journal_logs (Including ISSN)
            await this.journalLogRepository.query(
                `INSERT INTO journal_logs (
                borrower_uuid, journal_copy_uuid, action, description, 
                journal_title_uuid, issn, old_journal_copy, new_journal_copy, 
                old_journal_title, new_journal_title, ip_address
            ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
                [
                    studentExists[0].student_uuid,
                    journalCopyUUID,
                    status,
                    'Journal Has Been Borrowed',
                    journalTitleUUID,
                    issn,
                    oldJournalCopy,
                    newJournalCopy,
                    oldJournalTitle,
                    newJournalTitle,
                    request.ip
                ]
            );

            return { statusCode: HttpStatus.CREATED, message: 'Journal borrowed successfully' };
        } catch (error) {
            throw error;
        }
    }


    // working
    async getJournalLogsByJournalUUID(
        { page, limit, search }: { page: number; limit: number; search?: string } = {
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
                [searchQuery, limit, offset]
            );

            // Get total count for pagination
            const total = await this.journalLogRepository.query(
                `SELECT COUNT(*) as count FROM journal_logs 
             WHERE journal_title_uuid::TEXT ILIKE $1`,
                [searchQuery]
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
            throw new HttpException('Error fetching Journals', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    // working
    async getAllUnavailableJournals(
        { page, limit }: { page: number; limit: number } = {
            page: 1,
            limit: 10,
        },
    ) {
        try {
            const offset = (page - 1) * limit;

            const journals = await this.journalsCopyRepository.query(
                `SELECT * FROM journal_copy
        WHERE is_archived = false AND is_available = false
        LIMIT $1 OFFSET $2`,
                [limit, offset],
            );

            const total = await this.journalsCopyRepository.query(
                `SELECT COUNT(*) as count FROM journal_copy 
        WHERE is_archived = false AND is_available = false`,
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
                    'Journal not found or already archived',
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
            return { message: 'Journal archived successfully' };
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
    async createJournal(createJournalPayload: TCreateJournalZodDTO) {
        try {
            //Check if journal exists in JournalTitle Table
            let journalTitleUUID: [{ journal_uuid: string }] = await this.journalsTitleRepository.query(
                `SELECT journal_uuid FROM journal_titles WHERE issn = $1`,
                [createJournalPayload.issn],
            );

            //Book Title Table logic
            if (!journalTitleUUID.length) {
                //Create custom Book Id
                const max: [{ max: null | string }] = await this.journalsTitleRepository.query(`SELECT MAX(journal_title_id) FROM journal_titles`);
                const journalId = genJournalId(max[0].max, 'JT');
                const journalTitlePayloadWithId = { ...createJournalPayload, journal_title_id: journalId };

                //Create the required Columns, Arg, and Values
                //Ignore the Columns that are used by Copy table
                const journalTitleQueryData = insertQueryHelper(journalTitlePayloadWithId, [
                    'barcode', 'item_type', 'institute_uuid', 'is_archived', 'is_available', 'created_by', 'remarks', 'copy_images', 'copy_additional_fields', 'copy_description'
                ]);

                //Convert some specific fields to string
                journalTitleQueryData.values.forEach((element, idx) => {
                    if (Array.isArray(element) || typeof element === 'object') {
                        journalTitleQueryData.values[idx] = JSON.stringify(element);
                    }
                });
                journalTitleUUID = await this.journalsTitleRepository.query
                    (
                        `INSERT INTO journal_titles (${journalTitleQueryData.queryCol}) VALUES (${journalTitleQueryData.queryArg}) RETURNING journal_uuid`,
                        journalTitleQueryData.values
                    );
            } else {
                await this.journalsTitleRepository.query
                    (
                        `UPDATE journal_titles SET total_count = total_count + 1, available_count = available_count + 1, updated_at = NOW() WHERE issn = $1`,
                        [createJournalPayload.issn],
                    );
            }
            //Book Copy Table logic

            //Create custom Book Id
            const max: [{ max: null | string }] = await this.journalsTitleRepository.query(`SELECT MAX(journal_copy_id) FROM journal_copy`);
            const journalId = genJournalId(max[0].max, 'JC');
            const journalCopyPayloadWithId = { ...createJournalPayload, journal_copy_id: journalId, journal_title_uuid: journalTitleUUID[0].journal_uuid };

            //Create the required Columns, Arg, and Values
            //Ignore the Columns that are used by Title table
            const journalCopyQueryData = insertQueryHelper(journalCopyPayloadWithId, [
                'journal_title', 'editor_name', 'name_of_publisher', 'place_of_publication', 'subscription_start_date', 'subscription_end_date', 'issn', 'volume_no', 'frequency', 'issue_number', 'vendor_name', 'subscription_price', 'library_name', 'classification_number', 'is_archived', 'total_count', 'available_count', 'title_images', 'title_additional_fields', 'title_description'
            ]);

            //Convert some specific fields to string
            journalCopyQueryData.values.forEach((element, idx) => {
                if (Array.isArray(element) || typeof element === 'object') {
                    journalCopyQueryData.values[idx] = JSON.stringify(element);
                }
            });

            await this.journalsCopyRepository.query
                (
                    `INSERT INTO journal_copy (${journalCopyQueryData.queryCol}) VALUES (${journalCopyQueryData.queryArg})`,
                    journalCopyQueryData.values
                );
            return { statusCode: HttpStatus.CREATED, message: "Journal created" }
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
                `SELECT * FROM journal_logs INNER JOIN journal_copy ON journal_copy.journal_copy_uuid = journal_logs.journal_copy_uuid;`
            );

            const studentLogs = await this.journalLogRepository.query(
                `SELECT * FROM journal_logs INNER JOIN students_table ON students_table.student_uuid = journal_logs.borrower_uuid;`
            );

            const total = await this.journalLogRepository.query
                (
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
                    'Journal not found or already active',
                    HttpStatus.NOT_FOUND,
                );
            }

            await this.journalsTitleRepository.query(
                `UPDATE journal_titles SET is_archived = false WHERE journal_uuid = $1`,
                [journal_uuid],
            );

            return { message: 'Journal restored successfully' };
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

            const journal = await this.journalsTitleRepository.query(query.concat(' LIMIT 1'), queryParams);

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

    // working
    async getJournalCopies(
        { page, limit }: { page: number; limit: number } = {
            page: 1,
            limit: 10,
        },
    ) {
        try {
            const offset = (page - 1) * limit;

            const journals = await this.journalsCopyRepository.query(
                `SELECT * FROM journal_copy 
            WHERE is_archived = false
            LIMIT $1 OFFSET $2`,
                [limit, offset],
            );

            const total = await this.journalsCopyRepository.query(
                `SELECT COUNT(*) as count FROM journal_copy
            WHERE is_archived = false`,
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
    async getSingleJournalCopyInfo(identifier: string) {
        try {
            let query = `SELECT * FROM journal_copy WHERE `;
            let params: string[] = []; // Only store strings since barcode is a string

            if (!isNaN(Number(identifier))) { // Check if identifier is a numeric string (barcode)
                query += `(barcode = $1) `;
            } else {
                query += `(journal_copy_uuid=$1) `
            }

            params.push(identifier); // Always store identifier as a string
            query += ` AND is_archived = false`; // Ensure correct query syntax

            const journal = await this.journalsCopyRepository.query(query, params);

            if (!journal.length) {
                throw new HttpException('No journal found', HttpStatus.NOT_FOUND);
            }

            return { message: 'Journal fetched successfully', journal: journal[0] };
        } catch (error) {
            throw new HttpException('Error fetching copy', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    // working
    async updateJournalTitle(updateJournalPayload: TUpdateJournalTitleDTO) {
        try {
            let queryData = updateQueryHelper<TUpdateJournalTitleDTO>
                (updateJournalPayload, [])
            const journal = await this.journalsTitleRepository.query(
                `SELECT * FROM journal_titles WHERE journal_uuid='${updateJournalPayload.journal_uuid}'`
            )
            if (journal.length === 0) {
                throw new HttpException(
                    'Journal Not Found ',
                    HttpStatus.NOT_FOUND,
                );
            }
            const result = await this.journalsTitleRepository.query(
                `UPDATE journal_titles 
                 SET ${queryData.queryCol}
                 WHERE journal_uuid='${updateJournalPayload.journal_uuid}' AND is_archived=false`,
                queryData.values
            )

            return {
                message: "Journal Updated Successfully!"
            }

        } catch (error) {
            throw error
        }
    }




    // working
    async archiveJournalCopy(journal_copy_uuid: string) {
        try {
            // Archive the book copy and get the bookTitleUUID
            const archiveResult = await this.journalsCopyRepository.query(
                `UPDATE journal_copy SET is_archived = true WHERE journal_copy_uuid = $1 RETURNING journal_title_uuid`,
                [journal_copy_uuid],
            );

            if (archiveResult.length === 0) {
                throw new Error('Journal copy not found or already archived');
            }

            const journalTitleUUID = archiveResult[0][0].journal_title_uuid;

            console.log({ journalTitleUUID });

            // Reduce total_count and available_count in book_titles
            await this.journalsTitleRepository.query(
                `UPDATE journal_titles SET total_count = GREATEST(total_count - 1, 0), available_count = GREATEST(available_count - 1, 0)WHERE journal_uuid = $1`,
                [journalTitleUUID],
            );

            return { success: true, message: 'Journal copy archived successfully' };
        } catch (error) {
            throw new Error('Failed to archive journal copy');
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
    async restoreJournalCopy(journal_copy_uuid: string) {
        try {
            const journal = await this.journalsCopyRepository.query(
                `SELECT * FROM journal_copy WHERE journal_copy_uuid = $1 AND is_archived = true`,
                [journal_copy_uuid],
            );

            if (journal.length === 0) {
                throw new HttpException(
                    'Journal not found or already active',
                    HttpStatus.NOT_FOUND,
                );
            }

            await this.journalsTitleRepository.query(
                `UPDATE journal_copy SET is_archived = false WHERE journal_copy_uuid = $1 RETURNING journal_title_uuid`,
                [journal_copy_uuid],
            );

            const journalTitleUUID = journal[0].journal_title_uuid;

            await this.journalsTitleRepository.query(
                `UPDATE journal_titles 
            SET 
            total_count = total_count + 1, 
              available_count = available_count + 1
            WHERE journal_uuid = $1`,
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

}
