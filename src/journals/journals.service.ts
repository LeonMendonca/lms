import { HttpException, HttpStatus, Injectable, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { JournalCopy, TJournalCopy } from './entity/journals_copy.entity';
import { JournalTitle, TJournalTitle } from './entity/journals_title.entity';
import { JournalLogs, TJournalLogs } from './entity/journals_log.entity';
import { TCreateJournalZodDTO } from './zod-validation/createjournaldto-zod';
import { genJournalId } from './create-journal-id';
import { insertQueryHelper } from 'src/misc/custom-query-helper';
import { UpdateJournalTitleDTO } from './zod-validation/updatejournaldto';
import { Students } from 'src/students/students.entity';
import { privateDecrypt } from 'crypto';
import { TCreateJournalLogDTO } from './zod-validation/create-journallog-zod';
import { TCreateBooklogV2DTO } from 'src/books_v2/zod/create-booklogv2-zod';

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

            const books = await this.journalsTitleRepository.query
                (
                    `SELECT * FROM journal_titles WHERE journal_title LIKE $1 AND is_archived = false LIMIT $2 OFFSET $3;`,
                    [searchQuery, limit, offset]
                );
            const total = await this.journalsTitleRepository.query(
                `SELECT COUNT(*) as count FROM journal_title
            WHERE is_archived = false AND journal_title ILIKE $1`,
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

    async getJournalCopiesByTitle({
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
            let query = `SELECT journal_uuid, journal_title FROM journal_titles WHERE 1=1`;

            if (journal_uuid) {
                query += ` AND journal_uuid = $${queryParams.length + 1}`;
                queryParams.push(journal_uuid);
            }
            if (issn) {
                query += ` AND issn = $${queryParams.length + 1}`;
                queryParams.push(issn);
            }
            if (titlename) {
                query += ` AND journal_title LIKE $${queryParams.length + 1}`;
                queryParams.push(`${titlename}%`);
            }

            const journal = await this.journalsTitleRepository.query(query, queryParams);

            console.log({ journal });
            console.log("THIS IS THE UUID", journal[0]);

            if (journal.length === 0) {
                throw new HttpException('Journal not found', HttpStatus.NOT_FOUND);
            }


            const journals = await this.journalsCopyRepository.query(
                `SELECT * FROM journal_copy
        WHERE is_archived = false AND journal_title_uuid = $1`,
                [journal[0].journal_uuid],
            );

            console.log({ journals });

            return {
                title: journal,
                copies: journals,
            };
        } catch (error) {
            console.log(error);
            throw new HttpException(
                'Error fetching Journals',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

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

    async getJournalLogDetailsByCopy({ barcode }: { barcode: string }) {
        try {
            const journal = await this.journalsCopyRepository.query(
                `SELECT * FROM journal_copy 
        WHERE barcode = $1`,
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

    async getAllAvailableJournals(
        { page, limit }: { page: number; limit: number } = {
            page: 1,
            limit: 10,
        },
    ) {
        try {
            const offset = (page - 1) * limit;

            const journals = await this.journalsCopyRepository.query(
                `SELECT * FROM journal_copy 
        WHERE is_archived = false AND is_available = true
        LIMIT $1 OFFSET $2`,
                [limit, offset],
            );

            const total = await this.journalsCopyRepository.query(
                `SELECT COUNT(*) as count FROM journal_copy 
        WHERE is_archived = false AND is_available = true`,
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


    async getAvailableJournalByIssn(issn: string) {
        try {
            const journalTitle = await this.journalsTitleRepository.query(
                `SELECT * FROM journal_titles WHERE issn = $1 LIMIT 1`,
                [issn],
            );
            console.log({ journalTitle });
            const result = await this.journalsCopyRepository.query(
                `SELECT * FROM journal_copy WHERE journal_title_uuid = $1 AND is_available = false AND is_archived = false`,
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

    async updateJournalTitleArchive(journal_uuid: string) {
        try {
            // Check if the book exists and is not archived
            const journal = await this.journalsTitleRepository.query(
                `SELECT * FROM journal_titles WHERE journal_uuid ='${journal_uuid}' AND is_archived = false`,
            );
            console.log({ journal });

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
            console.log(error);
            throw new HttpException(
                'Error archiving journal',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async searchJournalIssn(issn: string) {
        const result = await this.journalsTitleRepository.query
            (`SELECT journal_copy.source_of_acquisition, 
                journal_copy.date_of_acquisition, 
                journal_copy.bill_no, 
                journal_copy.language,
                journal_copy.inventory_number, 
                journal_copy.accession_number, 
                journal_copy.barcode, 
                journal_copy.item_type, 
                journal_copy.remarks,
                journal_titles.journal_title,
                journal_titles.journal_author,
                journal_titles.name_of_publisher,
                journal_titles.place_of_publication,
                journal_titles.year_of_publication,
                journal_titles.edition,
                journal_titles.subject,
                journal_titles.department,
                journal_titles.call_number,
                journal_titles.author_mark,
                journal_titles.title_images,
                journal_titles.title_additional_fields,
                journal_titles.title_description,
                journal_titles.no_of_pages,
                journal_titles.no_of_preliminary,
                journal_titles.issn FROM journal_titles INNER JOIN journal_copy on journal_titles.journal_uuid = journal_copy.journal_title_uuid where journal_titles.issn='${issn}' LIMIT 1`);
        if (result.length === 0) {
            throw new Error('No data found');
        }
        return result;
    }


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
                const journalId = genJournalId(max[0].max, 'BT');
                const journalTitlePayloadWithId = { ...createJournalPayload, journal_title_id: journalId };

                //Create the required Columns, Arg, and Values
                //Ignore the Columns that are used by Copy table
                const journalTitleQueryData = insertQueryHelper(journalTitlePayloadWithId, [
                    'source_of_acquisition', 'date_of_acquisition', 'bill_no', 'language',
                    'inventory_number', 'accession_number', 'barcode', 'item_type', 'institute_uuid',
                    'created_by', 'remarks', 'copy_images', 'copy_description', 'copy_additional_fields'
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
            const journalId = genJournalId(max[0].max, 'BC');
            const journalCopyPayloadWithId = { ...createJournalPayload, journal_copy_id: journalId, journal_title_uuid: journalTitleUUID[0].journal_uuid };

            //Create the required Columns, Arg, and Values
            //Ignore the Columns that are used by Title table
            const journalCopyQueryData = insertQueryHelper(journalCopyPayloadWithId, [
                'journal_title', 'journal_author', 'name_of_publisher', 'place_of_publication',
                'year_of_publication', 'edition', 'issn', 'no_of_pages', 'no_of_preliminary', 'subject',
                'department', 'call_number', 'author_mark', 'title_images', 'title_description', 'title_additional_fields'
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
                `SELECT * FROM journal_titles 
        WHERE is_archived = true AND journal_title ILIKE $1
        LIMIT $2 OFFSET $3`,
                [searchQuery, limit, offset],
            );

            const total = await this.journalsTitleRepository.query(
                `SELECT COUNT(*) as count FROM journal_titles 
        WHERE is_archived = true AND journal_title ILIKE $1`,
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

    async getSingleJournalCopyInfo(identifier: string) {
        try {
            let query = `SELECT * FROM journal_copy WHERE `;
            let params: (string | number)[] = [];

            if (!isNaN(Number(identifier))) {
                query += `(barcode = $1 OR inventory_number = $1) `;
                params.push(Number(identifier)); // Convert to BIGINT
            } else {
                query += `journal_copy_uuid = $1 `;
                params.push(identifier);
            }

            query += `AND is_archived = false`;

            const journal = await this.journalsCopyRepository.query(query, params);

            return { message: 'Journal fetched successfully', journal: journal[0] };
        } catch (error) {
            console.log(error);
            throw new HttpException(
                'Error fetching copy',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // not working properly
    async updateJournalTitle(id: string, updateJournalPayload: UpdateJournalTitleDTO) {
        try {
            const journal = await this.journalsTitleRepository.query(
                `SELECT * FROM journal_titles WHERE journal_uuid = $1 AND is_archived = false LIMIT 1 `,
                [id],
            );

            if (!journal) {
                throw new HttpException('Journal not found', HttpStatus.NOT_FOUND);
            }

            await this.journalsTitleRepository.query(
                `UPDATE journal_titles 
            SET 
            journal_title = COALESCE($2, journal_title),
              journal_author = COALESCE($3, journal_author),
              name_of_publisher = COALESCE($4, name_of_publisher),
              place_of_publication = COALESCE($5, place_of_publication),
              year_of_publication = COALESCE($6, year_of_publication),
              edition = COALESCE($7, edition),
              issn = COALESCE($8, issn),
              subject = COALESCE($9, subject),
              department = COALESCE($10, department),
              total_count = COALESCE($11, total_count),
              available_count = COALESCE($12, available_count),
              title_images = COALESCE($13, title_images),
              title_additional_fields = COALESCE($14, title_additional_fields),
              title_description = COALESCE($15, title_description),
              updated_at = NOW()
            WHERE journal_uuid = $1`,
                [
                    id,
                    updateJournalPayload.journalTitle,
                    updateJournalPayload.journalAuthor,
                    updateJournalPayload.nameOfPublisher,
                    updateJournalPayload.placeOfPublication,
                    updateJournalPayload.yearOfPublication,
                    updateJournalPayload.edition,
                    updateJournalPayload.issn,
                    updateJournalPayload.subject,
                    updateJournalPayload.department,
                    updateJournalPayload.totalCount,
                    updateJournalPayload.availableCount,
                    updateJournalPayload.images,
                    updateJournalPayload.additionalFields,
                    updateJournalPayload.description,
                ],
            );

            return { message: 'Journal updated successfully' };
        } catch (error) {
            console.log(error);
            throw new HttpException('Error updating journal', HttpStatus.BAD_REQUEST);
        }
    }

    async archiveJournalCopy(journal_copy_uuid: string) {
        try {
            // Archive the book copy and get the bookTitleUUID
            const archiveResult = await this.journalsCopyRepository.query(
                `UPDATE journal_copy 
        SET is_archived = true 
        WHERE journal_copy_uuid = $1 
        RETURNING journal_title_uuid`,
                [journal_copy_uuid],
            );

            if (archiveResult.length === 0) {
                throw new Error('Journal copy not found or already archived');
            }

            const journalTitleUUID = archiveResult[0][0].journal_title_uuid;

            console.log({ journalTitleUUID });

            // Reduce total_count and available_count in book_titles
            await this.journalsTitleRepository.query(
                `UPDATE journal_titles 
        SET 
        total_count = GREATEST(total_count - 1, 0), 
          available_count = GREATEST(available_count - 1, 0)
        WHERE journal_uuid = $1`,
                [journalTitleUUID],
            );

            return { success: true, message: 'Journal copy archived successfully' };
        } catch (error) {
            console.error('Error archiving journal copy:', error);
            throw new Error('Failed to archive journal copy');
        }
    }

    async getArchivedJournalsCopy(
        { page, limit }: { page: number; limit: number } = {
            page: 1,
            limit: 10,
        },
    ) {
        try {
            const offset = (page - 1) * limit;

            const journals = await this.journalsCopyRepository.query(
                `SELECT * FROM journal_copy 
            WHERE is_archived = true
            LIMIT $1 OFFSET $2`,
                [limit, offset],
            );

            const total = await this.journalsCopyRepository.query(
                `SELECT COUNT(*) as count FROM journal_copy
            WHERE is_archived = true`,
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

    async restoreJournalCopy(journal_uuid: string) {
        try {
            const journal = await this.journalsCopyRepository.query(
                `SELECT * FROM journal_copy WHERE journal_copy_uuid = $1 AND is_archived = true`,
                [journal_uuid],
            );

            if (journal.length === 0) {
                throw new HttpException(
                    'Journal not found or already active',
                    HttpStatus.NOT_FOUND,
                );
            }

            await this.journalsTitleRepository.query(
                `UPDATE journal_copy SET is_archived = false WHERE journal_copy_uuid = $1 RETURNING journal_title_uuid`,
                [journal_uuid],
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


    // async setJournalLibrary(journallogPayload: TCreateJournalLogDTO, ipAddress: string) {
    //     try {
    //         // Validate student existence
    //         const studentExists = await this.studentsRepository.query(
    //             `SELECT * FROM students_table WHERE student_uuid = $1`,
    //             [journallogPayload.student_id],
    //         );

    //         if (studentExists.length === 0) {
    //             console.error(' Invalid Student ID:', journallogPayload.student_id);
    //             throw new HttpException('Invalid Student UUID', HttpStatus.BAD_REQUEST);
    //         }

    //         const journalData = await this.journalsCopyRepository.query(
    //             `SELECT * FROM journal_copy WHERE (barcode=$1 AND is_available=true)`,
    //             [journallogPayload.barcode],
    //         );

    //         if (journalData.length === 0) {
    //             console.error(' Invalid Journal UUID:', journallogPayload.journal_copy_id);
    //             throw new HttpException('Invalid Barcode', HttpStatus.BAD_REQUEST);
    //         }

    //         const newData = await this.journalsCopyRepository.query(
    //             `UPDATE journal_copy SET is_available = FALSE WHERE journal_copy_uuid = $1 RETURNING *`,
    //             [journalData[0].journal_copy_uuid],
    //         );
    //         const newTitle = await this.journalsTitleRepository.query(
    //             `UPDATE journal_titles SET available_count = available_count - 1 
    //             WHERE journal_uuid = $1 RETURNING *`,
    //             [journalData[0].journal_title_uuid],
    //         );

    //         //  Fetch Old Book Copy Data
    //         const oldBookCopy = journalData[0];
    //         const newBookCopyData = newData[0];
    //         const newBookTitleData = newTitle[0];

    //         const insertLogQuery = `
    //           INSERT INTO journal_logs 
    //           (borrower_uuid, borrower_uuid, new_journal_title, old_journal_copy, new_journal_copy, action, description, ip_address, time, journal_log_uuid, journal_copy_uuid)
    //           VALUES 
    //           ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), $9, $10)
    //           `;

    //         console.log({ newBookTitleData, newBookCopyData });

    //         //const insertLogValues = [
    //         //  booklogpayload.borrower_id,
    //         //  booklogpayload.borrower_id,
    //         //  JSON.stringify(newBookTitleData),
    //         //  JSON.stringify(oldBookCopy),
    //         //  JSON.stringify(newBookCopyData),
    //         //  'read',
    //         //  'Book has been borrowed to be read in the library',
    //         //  ipAddress,
    //         //  newBookTitleData[0].book_uuid,
    //         //  newBookCopyData[0].book_copy_uuid,
    //         //];

    //         //await this.booktitleRepository.query(insertLogQuery, insertLogValues);
    //         return { message: 'Journal borrowed successfully' };
    //     } catch (error) {
    //         console.error('Error setting journal in library:', error);
    //         throw new HttpException(
    //             'Error setting journal in library',
    //             HttpStatus.INTERNAL_SERVER_ERROR,
    //         );
    //     }
    // }

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
    //         const journalPayloadFromBookCopies: TJournalCopy[] = await this.journalsCopyRepository.query
    //             (
    //                 `SELECT * FROM journal_copy WHERE journal_copy_id = $1 AND barcode = $2 AND is_available = TRUE`,
    //                 [journalLogPayload.journal_copy_id, journalLogPayload.barcode]
    //             );

    //         if (!journalPayloadFromBookCopies.length) {
    //             throw new HttpException("Cannot find Journal", HttpStatus.NOT_FOUND);
    //         }


    //         //Check if Book exists in Book Titles through book_title_uuid received from Book Copies via SELECT query
    //         //Also make sure it's available
    //         //Insert into old_book_title COLUMN
    //         const jounralPayloadFromBookTitle: TJournalTitle[] = await this.journalsCopyRepository.query
    //             (
    //                 `SELECT * FROM journal_titles WHERE journal_uuid = $1 AND available_count > 0`,
    //                 [journalPayloadFromBookCopies[0].journal_title_uuid]
    //             )

    //         if (!jounralPayloadFromBookTitle.length) {
    //             throw new HttpException("Journal doesn't seems to be available in Book Titles, but exists in Journal Copies", HttpStatus.INTERNAL_SERVER_ERROR);
    //         }

    //         //UPDATING now is safe
    //         //Insert into new_book_copy
    //         const updatedJournalCopiesPayload: [TJournalCopy[], 0 | 1] = await this.journalsCopyRepository.query
    //             (
    //                 `UPDATE journal_copy SET is_available = FALSE WHERE journal_copy_uuid = $1 AND barcode = $2 AND is_available = TRUE 
    //         RETURNING *`,
    //                 [journalPayloadFromBookCopies[0].journal_copy_uuid, journalPayloadFromBookCopies[0].barcode],
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
    //         const updatedBookTitlePayload: [TJournalTitle[], 0 | 1] = await this.journalsTitleRepository.query
    //             (
    //                 `UPDATE journal_titles SET available_count = available_count - 1 WHERE journal_uuid = $1 RETURNING *`,
    //                 [journalTitleUUID]
    //             );

    //         const oldJournalCopy = JSON.stringify(journalPayloadFromBookCopies[0]);
    //         const newJournalCopy = JSON.stringify(updatedJournalCopiesPayload[0][0]);

    //         const oldJournalTitle = JSON.stringify(jounralPayloadFromBookTitle[0]);
    //         const newJournalTitle = JSON.stringify(updatedBookTitlePayload[0][0]);

    //         await this.journalLogRepository.query
    //             (
    //                 `INSERT INTO journal_logs (
    //           borrower_uuid, journal_copy_uuid, action, description, journal_title_uuid,
    //           old_journal_copy, new_journal_copy, old_journal_title, new_journal_title, ip_address
    //         ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    //                 [
    //                     studentExists[0].student_uuid, journalCopyUUID, status, 'Book has been borrowed', journalTitleUUID,
    //                     oldJournalCopy, newJournalCopy, oldJournalTitle, newJournalTitle, request.ip
    //                 ]
    //             );

    //         return { statusCode: HttpStatus.CREATED, message: 'Journal borrowed successfully' };
    //     } catch (error) {
    //         throw error;
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
    //         const bookPayloadFromBookCopies: TJournalCopy[] = await this.journalsCopyRepository.query
    //             (
    //                 `SELECT * FROM journal_copy WHERE journal_copy_id = $1 AND barcode = $2 AND is_available = FALSE`,
    //                 [journalLogPayload.journal_copy_id, journalLogPayload.barcode]
    //             );

    //         if (!bookPayloadFromBookCopies.length) {
    //             throw new HttpException("Cannot find Borrowed Journal", HttpStatus.NOT_FOUND);
    //         }

    //         const bookBorrowedPayload: TJournalLogs[] = await this.journalLogRepository.query(
    //             `SELECT * FROM journal_logs WHERE borrower_uuid = $1 AND journal_copy_uuid = $2 AND action = 'borrowed'`,
    //             [studentExists[0].student_uuid, bookPayloadFromBookCopies[0].journal_copy_uuid]
    //         );

    //         //if student doesn't exist in Booklog table (it hasn't borrowed), or it isn't the book that it borrowed, but attempting to return it
    //         if (!bookBorrowedPayload.length) {
    //             throw new HttpException('Student hasn\'t borrowed at all, or Invalid Journal is being returned', HttpStatus.NOT_FOUND);
    //         }

    //         //Check if Book hasn't reached its total count in Book Titles through book_title_uuid received from Book Copies via SELECT query
    //         //Insert into old_book_title COLUMN
    //         const bookPayloadFromBookTitle: TJournalTitle[] = await this.journalsCopyRepository.query
    //             (
    //                 `SELECT * FROM journal_titles WHERE journal_uuid = $1 AND available_count != total_count`,
    //                 [bookPayloadFromBookCopies[0].journal_title_uuid]
    //             )

    //         if (!bookPayloadFromBookTitle.length) {
    //             throw new HttpException("Seems like Journal is fully returned in Journal Titles, but exists in Journal Log as not returned", HttpStatus.INTERNAL_SERVER_ERROR);
    //         }

    //         //UPDATING now is safe
    //         //Insert into new_book_copy
    //         const updatedBookCopiesPayload: [TJournalCopy[], 0 | 1] = await this.journalsCopyRepository.query
    //             (
    //                 `UPDATE journal_copy SET is_available = TRUE WHERE journal_copy_uuid = $1 AND barcode = $2 AND is_available = FALSE
    //         RETURNING *`,
    //                 [bookPayloadFromBookCopies[0].journal_copy_uuid, bookPayloadFromBookCopies[0].barcode],
    //             );

    //         const updateStatus = updatedBookCopiesPayload[1];
    //         if (!updateStatus) {
    //             //if somehow the update fails, even after getting the data through SELECT query 
    //             throw new HttpException("Failed to update Book", HttpStatus.INTERNAL_SERVER_ERROR);
    //         }

    //         if (!updatedBookCopiesPayload[0].length) {
    //             //if for some reason update array response is empty, then
    //             throw new HttpException("Something went wrong", HttpStatus.INTERNAL_SERVER_ERROR);
    //         }

    //         const journalTitleUUID = updatedBookCopiesPayload[0][0].journal_title_uuid;
    //         const journalCopyUUID = updatedBookCopiesPayload[0][0].journal_copy_uuid;

    //         //Insert into new_book_copy COLUMN
    //         const updatedBookTitlePayload: [TJournalTitle[], 0 | 1] = await this.journalsTitleRepository.query
    //             (
    //                 `UPDATE journal_titles SET available_count = available_count + 1 WHERE journal_uuid = $1 RETURNING *`,
    //                 [journalTitleUUID]
    //             );

    //         const oldJournalCopy = JSON.stringify(bookPayloadFromBookCopies[0]);
    //         const newJournalCopy = JSON.stringify(updatedBookCopiesPayload[0][0]);

    //         const oldJournalTitle = JSON.stringify(bookPayloadFromBookTitle[0]);
    //         const newJournalTitle = JSON.stringify(updatedBookTitlePayload[0][0]);

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





}
