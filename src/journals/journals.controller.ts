import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Param, ParseIntPipe, ParseUUIDPipe, Post, Put, Query, UsePipes } from '@nestjs/common';
import { JournalsService } from './journals.service';
import { createJournalSchema, tCreateJournalDTO } from './zod-validation/createjournals-zod';
import { bodyValidationPipe } from 'src/pipes/body-validation.pipe';
import { createJournalCopySchema, tCreateJournalCopyDTO } from './zod-validation/createjournalcopies-zod';
import { putBodyValidationPipe } from 'src/pipes/put-body-validation.pipe';
import { tUpdateJournalCopyDTO, updateJournalCopySchema } from './zod-validation/updatejournalcopies-zod';
import { journalCopyQueryValidator, JournalCopyValidate } from './validators/journalcopy.query-validator';
import { QueryValidationPipe } from 'src/pipes/query-validation.pipe';
import { findJournalCopyQuerySchema } from './zod-validation/journalcopyquery-zod';
import { journalQueryValidator, JournalValidate } from './validators/journal.query-validation';
import { findJournalQuerySchema } from './zod-validation/journalquery-zod';
import { tUpdateJournalDTO, updateJournalSchema } from './zod-validation/updatejournal-zod';
import { UUID } from 'crypto';

@Controller('journals')
export class JournalsController {
    constructor(private journalsService: JournalsService) { }


    // ----- BOTH TABLE SIMULTAENOUSE FUNCTIONS -----

    // @Post('post-journal')
    // async createJournal(@Body() body: any) {
    //     return this.journalsService.createJournal(body)
    // }

    // @Post('post-journal')
    // @UsePipes(new bodyValidationPipe(createJournalSchema))
    // async createJournal(@Body() newJournal: tCreateJournalDTO) {
    //     return this.journalsService.createJournal(newJournal)
    // }

    // ----- JOURNAL TABLE FUNCTIONS -----

    @Get('all')
    async allJournalsFromTable() {
        return this.journalsService.allJournalsFromTable();
    }

    @Post('create-journal')
    @UsePipes(new bodyValidationPipe(createJournalSchema))
    async createJournalInTable(@Body() journalPayload: tCreateJournalDTO) {
        try {
            return this.journalsService.createJournalInTable(journalPayload);
        } catch (error) {
            return { error: error };
        }
    }

    @Get('search')
    @UsePipes(new QueryValidationPipe(findJournalQuerySchema, journalQueryValidator))
    async getJournal(@Query() query: JournalValidate) {
        const result = await this.journalsService.findJournal(query)
        if (result.length != 0) {
            return result[0]
        } else {
            throw new HttpException('No Journal Found', HttpStatus.NOT_FOUND)
        }
    }

    @Put('update-journal/:journal_uuid')
    @UsePipes(new putBodyValidationPipe(updateJournalSchema))
    async updateJournalInTable(
        @Param(
            'journal_uuid',
            new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
        )
        journal_uuid: UUID,
        @Body() journalPayload: tUpdateJournalDTO
    ) {
        try {
            const result = await this.journalsService.updateJournalInTable(journal_uuid, journalPayload)
            if (result[1]) {
                return {
                    message: "Journal Updated Successfully!",
                    updated_journal: result
                }
            } else {
                throw new Error(`Journal With UUID ${journal_uuid} Not Found`)
            }
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
        }
    }

    @Delete('delete-journal/:journal_uuid')
    async deleteJournalFromTable(
        @Param(
            'journal_uuid',
            new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })
        )
        journal_uuid: UUID
    ) {
        try {
            const result = await this.journalsService.deleteJournalFromTable(journal_uuid)
            if (result[1]) {
                return {
                    message: "Journal Deleted Successfully!",
                    updated_journal: result
                }
            } else {
                throw new Error(`Journal With ID ${journal_uuid} Not found`)
            }
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
        }
        // return this.journalsService.deleteJournalFromTable()
    }


    // ----- JOURNAL COPY TABLE FUNCTIONS -----

    @Get('all-incopy')
    async allJournalsFromCopy() {
        return this.journalsService.allJournalsFromCopy();
    }

    @Post('create-journal-incopy')
    @UsePipes(new bodyValidationPipe(createJournalCopySchema))
    async createJournalInCopy(@Body() journalCopyPayload: tCreateJournalCopyDTO) {
        try {
            return this.journalsService.createJournalInCopy(journalCopyPayload);
        } catch (error) {
            return { error: error };
        }
    }

    @Get('search-incopy')
    @UsePipes(new QueryValidationPipe(findJournalCopyQuerySchema, journalCopyQueryValidator))
    async getJournalInCopy(@Query() query: JournalCopyValidate) {
        const result = await this.journalsService.findJournalFromCopy(query)
        if (result.length != 0) {
            return result[0]
        } else {
            throw new HttpException('No Journal Found', HttpStatus.NOT_FOUND)
        }
    }

    @Put('update-journal-incopy/:journal_id')
    @UsePipes(new putBodyValidationPipe(updateJournalCopySchema))
    async updateJournalInCopy(
        @Param(
            'journal_id',
            new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
        )
        journal_id: number,
        @Body() journalPayload: tUpdateJournalCopyDTO,
    ) {
        try {
            const result = await this.journalsService.updateJournalInCopy(journal_id, journalPayload)
            if (result[1]) {
                return {
                    message: "Journal Updated Successfully!",
                    updated_journal: result
                }
            } else {
                throw new Error(`Journal With ID ${journal_id} Not found`)
            }
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
        }
    }

    @Delete('delete-journal-incopy/:journal_id')
    async deleteJournalFromCopy(
        @Param(
            'journal_id',
            new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })
        )
        journal_id: number
    ) {
        try {
            const result = await this.journalsService.deleteJournalFromCopy(journal_id)
            if (result[1]) {
                return {
                    message: "Journal Deleted Successfully!",
                    updated_journal: result
                }
            } else {
                throw new Error(`Journal With ID ${journal_id} Not found`)
            }
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
        }
    }
}


// get journal - done
// create journal
// update journal
// delete journal
// find journal