import { JournalsCopy } from './entity/journals_copy.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JournalsTable } from './entity/journals_table.entity';
import { DataSource, Repository } from 'typeorm';
import { createJournalSchema, tCreateJournalDTO } from './zod-validation/createjournals-zod';
import { insertQueryHelper, updateQueryHelper } from 'src/custom-query-helper';
import { tCreateJournalCopyDTO } from './zod-validation/createjournalcopies-zod';
import { tUpdateJournalCopyDTO } from './zod-validation/updatejournalcopies-zod';
import { journalCopyQueryValidator, JournalCopyValidate } from './validators/journalcopy.query-validator';
import { findJournalCopyQuerySchema } from './zod-validation/journalcopyquery-zod';
import { journalQueryValidator, JournalValidate } from './validators/journal.query-validation';
import { findJournalQuerySchema } from './zod-validation/journalquery-zod';
import { tUpdateJournalDTO } from './zod-validation/updatejournal-zod';
import { UUID } from 'crypto';

@Injectable()
export class JournalsService {
    constructor(
        @InjectRepository(JournalsTable)
        private journalsRepository: Repository<JournalsTable>,

        @InjectRepository(JournalsCopy)
        private journalsCopyRepository: Repository<JournalsCopy>,

        private readonly dataSource: DataSource
    ) { }

    // ----- BOTH TABLE SIMULTAENOUSE FUNCTIONS -----

    // async createJournal(data: any) {
    //     const parsedData = createJournalSchema.parse(data);

    //     return this.dataSource.transaction(async (manager) => {
    //         // Step 1: Save journal_table entry
    //         const savedJournal = await manager.save(JournalsTable, parsedData);

    //         // Step 2: Create journal_copy entries using the same journal_uuid
    //         const journalCopies = Array.from({ length: parsedData.total_count }).map(() =>
    //             manager.create(JournalsCopy, {
    //                 journal: savedJournal,
    //                 journal_uuid: savedJournal.journal_uuid, // ✅ Using the generated UUID
    //                 nameOfJournal: parsedData.name_of_journal,
    //                 nameOfPublisher: parsedData.name_of_publisher,
    //                 editorName: parsedData.editor_name,
    //                 language: parsedData.language,
    //                 department: parsedData.department,
    //                 volumeNumber: parsedData.volume_number,
    //                 issueNumber: parsedData.issue_number,
    //                 isArchived: parsedData.is_archived,
    //                 issn: parsedData.issn,
    //                 callNumber: parsedData.call_number,
    //                 createdAt: parsedData.created_at,
    //                 updatedAt: parsedData.updated_at,
    //                 vendorName: parsedData.vendor_name,
    //                 libraryName: parsedData.library_name,
    //                 acquisitionDate: parsedData.acquisition_date
    //             })
    //         );

    //         // Step 3: Save all copies at once
    //         await manager.save(JournalsCopy, journalCopies);

    //         return savedJournal;
    //     });
    // }


    // ----- JOURNAL TABLE FUNCTIONS -----

    async allJournalsFromTable() {
        return await this.journalsRepository.query(
            `SELECT * FROM journals_table WHERE is_archived=false AND available_count>0`
        )
    }

    async createJournalInTable(journalPayload: tCreateJournalDTO) {
        try {
            // this function updates the number of available_count when the book already exists
            const journal: [[], number] = await this.journalsRepository.query(
                `UPDATE journals_table 
                SET total_count=total_count+1, available_count=available_count+1
                WHERE name_of_journal='${journalPayload.name_of_journal}' 
                AND name_of_publisher='${journalPayload.name_of_publisher}' 
                AND volume_number='${journalPayload.volume_number}' 
                AND volume_number='${journalPayload.volume_number}' 
                AND is_archived=false`
            )

            // this creates a new tuple for a new book
            if (!journal[1]) {
                let queryData = insertQueryHelper(journalPayload, []);
                await this.journalsRepository.query(
                    `INSERT INTO journals_table (${queryData.queryCol}) VALUES (${queryData.queryArg})`,
                    queryData.values
                );
            }
            return {
                message: "Journal Created Successfully in Journal Table",
                journal: journal
            }
        } catch (error) {
            return {
                message: "Journal Not Created",
                error: error
            }
        }
    }

    async findJournal(query: JournalValidate) {
        let requiredKey: keyof typeof journalQueryValidator | undefined = undefined

        let value: string | number | boolean | undefined = undefined

        if ('journal_uuid' in query) {
            requiredKey = 'journal_uuid'
            value = query.journal_uuid
        } else if ('name_of_journal' in query) {
            requiredKey = 'name_of_journal'
            value = query.name_of_journal
        } else if ('name_of_publisher' in query) {
            requiredKey = 'name_of_publisher'
            value = query.name_of_publisher
        } else if ('place_of_publisher' in query) {
            requiredKey = 'place_of_publisher'
            value = query.place_of_publisher
        } else if ('editor_name' in query) {
            requiredKey = 'editor_name'
            value = query.editor_name
        } else if ('language' in query) {
            requiredKey = 'language'
            value = query.language
        } else if ('department' in query) {
            requiredKey = 'department'
            value = query.department
        } else if ('is_archived' in query) {
            const parsedQuery = findJournalQuerySchema.parse(query);
            requiredKey = 'is_archived'
            value = parsedQuery.is_archived
        } else if ('total_count' in query) {
            const parsedQuery = findJournalQuerySchema.parse(query)
            requiredKey = 'total_count'
            value = parsedQuery.total_count
        } else if ('available_count' in query) {
            const parsedQuery = findJournalQuerySchema.parse(query)
            requiredKey = 'available_count'
            value = parsedQuery.available_count
        } else if ('item_type' in query) {
            requiredKey = 'item_type'
            value = query.item_type
        } else if ('issn' in query) {
            requiredKey = 'issn'
            value = query.issn
        } else if ('call_number' in query) {
            requiredKey = 'call_number'
            value = query.call_number
        } else if ('vendor_name' in query) {
            requiredKey = 'vendor_name'
            value = query.vendor_name
        } else if ('library_name' in query) {
            requiredKey = 'library_name'
            value = query.library_name
        } else if ('subscription_price' in query) {
            const parsedQuery = findJournalQuerySchema.parse(query)
            requiredKey = 'subscription_price'
            value = parsedQuery.subscription_price
        } else if ('volume_number' in query) {
            const parsedQuery = findJournalQuerySchema.parse(query)
            requiredKey = 'volume_number'
            value = parsedQuery.volume_number
        } else {
            const parsedQuery = findJournalQuerySchema.parse(query)
            requiredKey = 'issue_number'
            value = parsedQuery.issue_number
        }

        return (await this.journalsCopyRepository.query(
            `SELECT * FROM journals_table WHERE ${requiredKey}=$1 AND is_archived=false`,
            [value]
        )) as JournalsTable[]

    }

    async updateJournalInTable(journal_uuid: UUID, editJournalPayload: tUpdateJournalDTO) {
        try {
            let queryData = updateQueryHelper<tUpdateJournalDTO>
                (editJournalPayload, [])
            const result = await this.journalsRepository.query(
                `UPDATE journals_table 
                SET ${queryData.queryCol}
                WHERE journal_uuid='${journal_uuid}' AND is_archived=false AND available_count>0`,
                queryData.values
            )
            return result
        } catch (error) {
            throw error
        }
    }

    // just archives the journal does not delete it
    async deleteJournalFromTable(journal_uuid: UUID) {
        try {
            const result = await this.journalsCopyRepository.query(
                `UPDATE journals_table SET is_archived = true WHERE journal_uuid = '${journal_uuid}' AND is_archived = false`
            )
            return result as [[], number]
        } catch (error) {
            throw error
        }
    }


    // ----- JOURNAL COPY TABLE FUNCTIONS -----

    async allJournalsFromCopy() {
        return await this.journalsCopyRepository.query(
            `SELECT * FROM journals_copy WHERE is_archived=false`
        )
    }

    async createJournalInCopy(journalCopyPayload: tCreateJournalCopyDTO) {
        try {
            let journalCopyData = insertQueryHelper(journalCopyPayload, [])
            await this.journalsCopyRepository.query(
                `INSERT INTO journals_copy (${journalCopyData.queryCol}) VALUES (${journalCopyData.queryArg})`,
                journalCopyData.values
            )
            return {
                message: "Journal Created Successfully in Journal Copy Table"
            }
        } catch (error) {
            console.log(error)
            return {
                message: "Failed to Create Journal",
                error: error
            }
        }
    }

    async findJournalFromCopy(query: JournalCopyValidate) {
        let requiredKey: keyof typeof journalCopyQueryValidator | undefined = undefined

        let value: string | number | boolean | undefined = undefined

        if ('name_of_journal' in query) {
            requiredKey = 'name_of_journal'
            value = query.name_of_journal
        } else if ('name_of_publisher' in query) {
            requiredKey = 'name_of_publisher'
            value = query.name_of_publisher
        } else if ('editor_name' in query) {
            requiredKey = 'editor_name'
            value = query.editor_name
        } else if ('language' in query) {
            requiredKey = 'language'
            value = query.language
        } else if ('department' in query) {
            requiredKey = 'department'
            value = query.department
        } else if ('volume_number' in query) {
            requiredKey = 'volume_number'
            value = query.volume_number
        } else if ('issue_number' in query) {
            const parsedQuery = findJournalCopyQuerySchema.parse(query);
            requiredKey = 'issue_number'
            value = parsedQuery.issue_number
        } else if ('is_archived' in query) {
            const parsedQuery = findJournalCopyQuerySchema.parse(query);
            requiredKey = 'is_archived'
            value = parsedQuery.is_archived
        } else if ('call_number' in query) {
            requiredKey = 'call_number'
            value = query.call_number
        } else if ('issn' in query) {
            requiredKey = 'issn'
            value = query.issn
        } else if ('journal_uuid' in query) {
            requiredKey = 'journal_uuid'
            value = query.journal_uuid
        } else if ('library_name' in query) {
            requiredKey = 'library_name'
            value = query.library_name
        } else if ('vendor_name' in query) {
            requiredKey = 'vendor_name'
            value = query.vendor_name
        } else {
            requiredKey = 'journal_id'
            value = query.journal_id
        }
        return (await this.journalsCopyRepository.query(
            `SELECT * FROM journals_copy WHERE ${requiredKey}=$1 AND is_archived=false`,
            [value]
        )) as JournalsCopy[]
    }

    async updateJournalInCopy(journal_id: number, editJournalPayload: tUpdateJournalCopyDTO) {
        try {
            let queryData = updateQueryHelper<tUpdateJournalCopyDTO>(editJournalPayload, [])
            const result = await this.journalsCopyRepository.query(
                `UPDATE journals_copy 
                SET ${queryData.queryCol}
                WHERE journal_id='${journal_id}' AND is_archived=false`,
                queryData.values
            )
            return result as [[], number]
        } catch (error) {
            throw error
        }
    }

    // just archives the journal
    async deleteJournalFromCopy(journal_id: number) {
        try {
            const result = await this.journalsCopyRepository.query(
                `UPDATE journals_copy SET is_archived = true WHERE journal_id = '${journal_id}' AND is_archived = false`
            )
            return result as [[], number]
        } catch (error) {
            throw error
        }
    }
}
