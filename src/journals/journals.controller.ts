import { UUID } from 'crypto';
import { Body, Controller, Get, HttpException, HttpStatus, Patch, Post, Put, Query, Req, UsePipes } from '@nestjs/common';
import { JournalsService } from './journals.service';
import { bodyValidationPipe } from 'src/pipes/body-validation.pipe';
import { createJournalSchema, TCreateJournalZodDTO } from './zod-validation/createjournaldto-zod';
import { TUpdateJournalTitleDTO, updateJournalSchema } from './zod-validation/updatejournaldto';
import { journalLogsSchema, TCreateJournalLogDTO } from './zod-validation/create-journallog-zod';

import type { Request } from 'express';

@Controller('journals')
export class JournalsController {
    constructor(private journalsService: JournalsService) { }

    // Get all journals
    @Get('all')
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

    @Get('get_copies_with_title')
    async getJournalCopiesByTitle(
        @Query('_journal_uuid') journal_uuid: string,
        @Query('_issn') issn: string,
        @Query('_titlename') titlename: string,
    ) {
        return this.journalsService.getJournalCopiesByTitle({
            journal_uuid,
            issn,
            titlename,
        });
    }

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

    @Get('get_all_available')
    async getAllAvailableJournals() {
        return this.journalsService.getAllAvailableJournals();
    }

    @Get('get_available_by_issn')
    async getAvailableJournalByIssn(
        @Query('_issn') issn: string,
    ) {
        return this.journalsService.getAvailableJournalByIssn(issn);
    }

    @Get('get_all_unavailable')
    async getAllUnavailableJournals() {
        return this.journalsService.getAllUnavailableJournals();
    }

    @Get('get_unavailable_by_issn')
    async getUnavailableJournalByIssn(
        @Query('_issn') issn: string,
    ) {
        return this.journalsService.getUnavailableJournalByIssn(issn);
    }

    @Put('uparchive')
    async updateJournalTitleArchive(@Body('journal_uuid') journal_uuid: string) {
        return this.journalsService.updateJournalTitleArchive(journal_uuid);
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

    @Post('create')
    @UsePipes(new bodyValidationPipe(createJournalSchema))
    async createJournal(@Body() journalPayload: TCreateJournalZodDTO) {
        try {
            // console.log(journalPayload)
            const result = await this.journalsService.createJournal(journalPayload);
            return result;
        } catch (error) {
            if (!(error instanceof HttpException)) {
                throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
            }
            throw error;
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

    @Put('restore_archive')
    async restoreJournal(@Body('journal_uuid') journal_uuid: string) {
        return this.journalsService.restoreJournal(journal_uuid);
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

    @Get('get_all_journal_copy')
    async fetchAllJournalCopyInfo(
        @Query('_page') page: string,
        @Query('_limit') limit: string,
    ) {
        return this.journalsService.getJournalCopies({
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 10,
        });
    }

    @Get('get_journal_copy')
    async fetchSingleJournalCopyInfo(@Query('_identifier') identifier: string) {
        return this.journalsService.getSingleJournalCopyInfo(identifier);
    }

    @Patch('update-journal-title')
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

