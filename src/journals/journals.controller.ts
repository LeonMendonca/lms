import { Body, Controller, Get, HttpException, HttpStatus, Param, ParseIntPipe, ParseUUIDPipe, Patch, Post, Put, Query, UsePipes } from '@nestjs/common';
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
import { retry } from 'rxjs';

@Controller('journals')
export class JournalsController {
    constructor(private journalsService: JournalsService) { }


    // ----- BOTH TABLE SIMULTAENOUS FUNCTIONS -----


    // ----- JOURNAL TABLE FUNCTIONS -----

    @Get('all')
    async allJournalsFromTable() {
        return this.journalsService.allJournalsFromTable();
    }

    @Get('get-all-available-journals')
    async getAllAvailableJournals() {
        return this.journalsService.getAllAvailableJournals()
    }

    @Get('get-available-by-issn')
    async getAvailableJournalByIssn(@Query('issn') issn: string) {
        return this.journalsService.getAvailableJournalByIssn(issn)
    }

    @Get('get-all-unavailable-journals')
    async getAllUnavailableJournals() {
        return this.journalsService.getAllUnavailableJournals();
    }

    @Get('get-all-unavailable-journals-by-issn')
    async getAllUnavailableJournalsByIssn(
        @Query('issn') issn: string,
    ) {
        return this.journalsService.getAllUnavailableJournalsByIssn(issn);
    }

    @Put('uparchive')
    async updateArchive(@Body('journal_uuid') journal_uuid: string) {
        return this.journalsService.updateTitleArchive(journal_uuid)
    }

    // @Get('issn')
    // async searchJournalIssn(@Query('issn') issn: string) {
    //     try {
    //         const result = await this.journalsService.issnJournal(issn)
    //         return result[0]
    //     } catch (error) {
    //         throw new HttpException(error.message, HttpStatus.NOT_FOUND)
    //     }
    // }

    @Post('create-journal')
    @UsePipes(new bodyValidationPipe(createJournalSchema))
    async createJournalInTable(@Body() journalPayload: tCreateJournalDTO) {
        try {
            return this.journalsService.createJournalInTable(journalPayload);
        } catch (error) {
            return { error: error };
        }
    }

    @Get('all_archived')
    async getAllArchivedJournals(
        @Query('_page') page: string,
        @Query('_limit') limit: string,
        @Query('_search') search: string,
    ) {
        return this.journalsService.getArchivedJournals({
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 10,
            search: search ?? undefined,
        });
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

    @Patch('update-journal/:journal_uuid') //PUT --> PATCH
    @UsePipes(new putBodyValidationPipe(updateJournalSchema))
    async updateJournalInTable(
        @Param(
            'journal_uuid',
            new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
        )
        journal_uuid: UUID,
        @Body() journalPayload: tUpdateJournalDTO
    ) {
        console.log(journalPayload)
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

    // Delete Logic - only need uuid 
    @Put('delete-journal/:journal_uuid')
    async deleteJournalFromTable(
        @Param(
            'journal_uuid',
            new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
        )
        journal_uuid: UUID,
    ) {
        try {
            const result = await this.journalsService.deleteJournalFromTable(journal_uuid)
            if (result[1]) {
                return {
                    message: "Journal Deleted Successfully!",
                    deleted_journal: result
                }
            } else {
                throw new Error(`Journal With UUID ${journal_uuid} Not Found`)
            }
        } catch (error) {
            // throw new Error(`Journal With UUID ${journal_uuid} Not Found`)
            return {
                message: "Journal Not Found"
            }
        }

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

    @Patch('update-journal-incopy/:journal_id') // PUT --> PATCH
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

    // Delete Logic - only need journal_id
    @Put('delete-journal-incopy/:journal_id')
    async deleteJournalFromCopy(
        @Param(
            'journal_id',
            new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
        )
        journal_id: number,
    ) {
        try {
            const result = await this.journalsService.deleteJournalFromCopy(journal_id)
            if (result[1]) {
                return {
                    message: "Journal Deleted Successfully!",
                    deleted_journal: result
                }
            } else {
                throw new Error(`Journal With UUID ${journal_id} Not Found`)
            }
        } catch (error) {
            // throw new Error(`Journal With UUID ${journal_uuid} Not Found`)
            return {
                message: "Journal Not Found"
            }
        }
    }
}

