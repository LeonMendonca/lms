import { UUID } from 'crypto';
import { Body, Controller, Get, HttpException, HttpStatus, Patch, Post, Put, Query, Req, UsePipes } from '@nestjs/common';
import { JournalsService } from './journals.service';
import { bodyValidationPipe } from 'src/pipes/body-validation.pipe';
import { createJournalSchema, TCreateJournalZodDTO } from './zod-validation/createjournaldto-zod';
import { TUpdateJournalTitleDTO, updateJournalSchema } from './zod-validation/updatejournaldto';
import { journalLogsSchema, TCreateJournalLogDTO } from './zod-validation/create-journallog-zod';

import type { Request } from 'express';
import { Subscription } from 'rxjs';

@Controller('journals')
export class JournalsController {
    constructor(private journalsService: JournalsService) { }


    // --------------- JOURNAL TITLE -------------------------

    // GET ALL JOURNALS/MAGAZINES - working
    // Get all journals from titles 
    @Get('all-periodicals')
    async getAllJournals(
        @Query('_page') page: string,
        @Query('_limit') limit: string,
        @Query('_search') search: string,
    ) {
        console.log(page, limit, search);
        return this.journalsService.getJournals({
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 10,
            search: search ?? undefined,
        });
    }

    // CREATE A NEW JOURNAL/MAGAZINE - working
    @Post('create-new-journal')
    @UsePipes(new bodyValidationPipe(createJournalSchema))
    async createJournal(@Body() journalPayload: TCreateJournalZodDTO) {
        try {
            const result = await this.journalsService.createJournal(journalPayload);
            return result;
        } catch (error) {
            if (!(error instanceof HttpException)) {
                throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
            }
            throw error;
        }
    }

    // UPDATE JOURNAL/MAGAZINE - working
    @Patch('update-periodical')
    @UsePipes(new bodyValidationPipe(updateJournalSchema))
    async updateJournalTitle(
        @Body() updateJournalPayload: TUpdateJournalTitleDTO
    ) {
        try {
            const result = await this.journalsService.updateJournalTitle(updateJournalPayload)
            return result
        } catch (error) {
            if (!(error instanceof HttpException)) {
                throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
            }
            throw error;
        }
    }


    // DELTE JOURNAL/MAGAZINE
    @Put('uparchive')
    async archivePeriodical(@Body('journal_uuid') journal_uuid: string) {
        return this.journalsService.archivePeriodical(journal_uuid);
    }

    // RESTORE PERIODICAL
    @Put('restore-archive')
    async restoreJournal(@Body('journal_uuid') journal_uuid: string) {
        return this.journalsService.restoreJournal(journal_uuid);
    }


    // FIND JOURNAL/MAGAZINE - working
    // search periodicals from copies and titles table both 
    // Note: You can pass all the required search parameters and get the data from titles AND/OR copy tables
    // Edit: trim() to be added at each field
    @Get('search-periodicals')
    async searchPeriodicals(
        @Query('_journal_uuid') journal_uuid?: string,
        @Query('_journal_title_id') journal_title_id?: string,
        @Query('_name_of_publisher') name_of_publisher?: string,
        @Query('_frequency') frequency?: string,
        @Query('_issue_number') issue_number?: string,
        @Query('_vendor_name') vendor_name?: string,
        @Query('_library_name') library_name?: string,
        @Query('_classification_number') classification_number?: string,
        @Query('_subscription_id') subscription_id?: string,
        @Query('_search') search?: string
    ) {
        return this.journalsService.searchPeriodicals({
            journal_uuid: journal_uuid ?? '',
            journal_title_id: journal_title_id ?? '',
            name_of_publisher: name_of_publisher ?? '',
            frequency: frequency ?? '',
            issue_number: issue_number ?? '',
            vendor_name: vendor_name ?? '',
            library_name: library_name ?? '',
            classification_number: classification_number ?? '',
            subscription_id: subscription_id ?? '',
            search: search ?? '',
        });
    }



    // -------------- GET ROUTES --------------

    // GET AVAILABLE PERIODICALS WITH/WITHOUT ISSN
    @Get('get-all-available-periodicals') //this returns as many copies of the same journal in copy but one entry in titles 
    async getAllAvailableJournalsOrByIssn(
        @Query('_issn') issn?: string,
        @Query('_page') page?: string,
        @Query('_limit') limit?: string,
        @Query('_search') search?: string
    ) {
        return this.journalsService.getAllAvailableJournalsOrByIssn({
            issn: issn ?? '',
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 10,
            search: search ?? '',
        });
    }

    // GET UNAVAILABLE PERIODICALS WITH/WITHOUT ISSN
    @Get('get-all-unavailable-periodicals')//this returns as many copies of the same journal in copy but one entry in titles 
    async getAllUnavailableJournals(
        @Query('_issn') issn?: string,
        @Query('_page') page?: string,
        @Query('_limit') limit?: string,
        @Query('_search') search?: string
    ) {
        return this.journalsService.getAllUnavailableJournals({
            issn: issn ?? '',
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 10,
            search: search ?? '',
        });
    }



    // ------------------ FILTER ----------------
    @Get('filter-periodicals')
    async filterByCategory(
        @Query('_category') category: string,
        @Query('_page') page?: string,
        @Query('_limit') limit?: string,
        @Query('_search') search?: string
    ) {
        return this.journalsService.filterByCategory(
            {
                category: category ?? '',
                page: page ? parseInt(page, 10) : 1,
                limit: limit ? parseInt(limit, 10) : 10,
                search: search ?? '',
            }
        )
    }


    // ---------- PERIODICALS COPY ---------------

    // FIND JOURNAL/MAGAZINE COPY - working
    @Get('get-all-copies')
    async fetchAllJournalCopyInfo(
        @Query('_journal_title') journal_title?: string,
        @Query('_editor_name') editor_name?: string,
        @Query('_issn') issn?: string,
        @Query('_barcode') barcode?: string,
        @Query('_item_type') item_type?: string,
        @Query('_institute_uuid') institute_uuid?: string,
        @Query('_page') page?: string,
        @Query('_limit') limit?: string,
        @Query('_search') search?: string
    ) {
        return this.journalsService.getJournalCopies({
            journal_title: journal_title ?? '',
            editor_name: editor_name ?? '',
            issn: issn ?? '',
            barcode: barcode ?? '',
            item_type: item_type ?? '',
            institute_uuid: institute_uuid ?? '',
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 10,
            search: search ?? '',
        });
    }




    // ------------------- PERIODICAL LOGS ---------------------



    // get journal by journal_title_id
    @Get('get-journals-by-journalid')
    async getJournalsByID(
        @Query('_page') page?: string,
        @Query('_limit') limit?: string,
        @Query('_search') search?: string,
        @Query('_journal_title_id') journal_title_id?: string
    ) {
        return this.journalsService.getJournalsByID({
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 10,
            search: search ?? '',
            journal_title_id: journal_title_id ?? ''
        });
    }




    // get journal logs from journal_log_uuid or issn number
    @Get('get-journal-logs-by-title')
    async getJournalLogDetailsByTitle(
        @Query('journal_log_uuid') journal_log_uuid: string,
        @Query('_issn') issn: string,
    ) {
        return this.journalsService.getJournalLogDetailsByTitle({
            journal_log_uuid,
            issn,
        });
    }

    @Get('get-logs-by-copy')
    async getJournalLogDetailsByCopy(@Query('_barcode') barcode: string) {
        return this.journalsService.getJournalLogDetailsByCopy({
            barcode,
        });
    }



    @Get('get_available_by_issn')
    async getAvailableJournalByIssn(
        @Query('_issn') issn: string,
    ) {
        return this.journalsService.getAvailableJournalByIssn(issn);
    }



    @Get('get_unavailable_by_issn')
    async getUnavailableJournalByIssn(
        @Query('_issn') issn: string,
    ) {
        return this.journalsService.getUnavailableJournalByIssn(issn);
    }



    @Get('issn')
    async searchJournalIssn(@Query('_issn') issn: string) {
        try {
            const result = await this.journalsService.searchJournalIssn(issn);
            return result[0];
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.NOT_FOUND);
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

    @Get('get_all_logs')
    async getJournalLogDetails(
        @Query('_page') page: string,
        @Query('_limit') limit: string,
    ) {
        return this.journalsService.getJournalLogDetails({
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 10,
        });
    }


    @Get('get_journal_title_details')
    async getJournalTitleDetails(
        @Query('_journal_uuid') journal_uuid: string,
        @Query('_issn') issn: string,
        @Query('_titlename') titlename: string,
    ) {
        return this.journalsService.getJournalTitleDetails({
            journal_uuid: journal_uuid ?? undefined,
            issn: issn ?? undefined,
            titlename: titlename ?? undefined,
        });
    }


    @Get('get-periodical-copies')
    async fetchSingleJournalCopyInfo(@Query('_journal_title_uuid') journal_title_uuid: string) {
        return this.journalsService.getSingleJournalCopyInfo(journal_title_uuid);
    }


    @Put('archive-journal-copy')
    async archiveJournalCopy(@Body('journal_uuid') journal_uuid: string) {
        return this.journalsService.archiveJournalCopy(journal_uuid);
    }

    @Get('get-archived-journal-copy')
    async getArchivedJournalsCopy(
        @Query('_page') page: string,
        @Query('_limit') limit: string,
    ) {
        return this.journalsService.getArchivedJournalsCopy({
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 10,
        });
    }

    @Put('restore-journal-copy')
    async restoreJournalCopy(@Body('journal_copy_uuid') journal_copy_uuid: string) {
        return this.journalsService.restoreJournalCopy(journal_copy_uuid);
    }


    @Patch('update_journal_copy')
    async updateJournalCopy(
        @Body('journal_uuid') journal_uuid: string,
        @Body() journalPayload: any,
    ) {
        return this.journalsService.updateJournalCopy(journal_uuid, journalPayload);
    }

    // maybe redundant code
    @Get('available')
    async availableJournal(@Query('issn') issn: string) {
        return await this.journalsService.getAvailableJournalByIssn(issn);
    }


    @Post('create-journal-log')
    @UsePipes(new bodyValidationPipe(journalLogsSchema))
    async createJournalLog(
        @Body() journalLogPayload: TCreateJournalLogDTO,
        @Req() request: Request,) {
        try {
            let status: 'borrowed' | 'returned' | 'in_library_borrowed' | undefined = undefined;
            let result: Record<string, string | number> = {};
            if (journalLogPayload.action === 'borrow') {
                result = await this.journalsService.journalBorrowed(journalLogPayload, request, status = 'borrowed');
            } else if (journalLogPayload.action === 'return') {
                result = await this.journalsService.journalReturned(journalLogPayload, request, status = 'returned')
            } else {
                result = await this.journalsService.journalBorrowed(journalLogPayload, request, status = 'in_library_borrowed');
            }
            return result;
        } catch (error) {
            if (!(error instanceof HttpException)) {
                throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
            }
            throw error;
        }
    }

    @Get('get-journal-logs-by-journal_uuid')
    async getJournalLogsByJournalUUID(
        @Query('_page') page: string,
        @Query('_limit') limit: string,
        @Query('_search') search: string,
    ) {

        console.log(page, limit, search);
        return this.journalsService.getJournalLogsByJournalUUID({
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 10,
            search: search ?? undefined,
        });
    }







}

