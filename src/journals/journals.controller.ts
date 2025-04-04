import { UUID } from 'crypto';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UsePipes,
} from '@nestjs/common';
import { JournalsService } from './journals.service';
import { bodyValidationPipe } from 'src/pipes/body-validation.pipe';
import {
  createJournalSchema,
  TCreateJournalZodDTO,
} from './zod-validation/createjournaldto-zod';
import {
  TUpdateJournalTitleDTO,
  updateJournalSchema,
} from './zod-validation/updatejournaldto';
import {
  journalLogsSchema,
  TCreateJournalLogDTO,
} from './zod-validation/create-journallog-zod';

import type { Request } from 'express';
import { Subscription } from 'rxjs';
import {
  TUpdatePeriodicalDTO,
  updatePeriodicalSchema,
} from './zod-validation/update-journacopydto-zod';
import { bulkBodyValidationPipe } from 'src/pipes/bulk-body-validation.pipe';
import { TPeriodicalCopyIdDTO } from './zod-validation/bulk-delete-periodical-copies-zod';
import { issueLogSchema, TIssueLogDTO } from './zod-validation/issue-zod';
import { BooksService } from 'src/books/books.service';

@Controller('journals')
export class JournalsController {
  constructor(
    private journalsService: JournalsService,
    // private booksService: BooksV2Service
  ) {}

  // --------------- JOURNAL TITLE -------------------------

  // GET ALL JOURNALS/MAGAZINES - working
  // Get all journals from titles
  @Get('all-periodicals')
  async getAllJournals(
    @Query('_page') page: string,
    @Query('_limit') limit: string,
    @Query('_search') search: string,
  ) {
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
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw error;
    }
  }

  // UPDATE JOURNAL/MAGAZINE - working
  @Patch('update-periodical')
  @UsePipes(new bodyValidationPipe(updateJournalSchema))
  async updateJournalTitle(
    @Body() updateJournalPayload: TUpdateJournalTitleDTO,
  ) {
    try {
      const result =
        await this.journalsService.updateJournalTitle(updateJournalPayload);
      return result;
    } catch (error) {
      if (!(error instanceof HttpException)) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw error;
    }
  }

  // DELETE PERIODICAL
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
  // search periodicals from copies table
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
    @Query('_search') search?: string,
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
    @Query('_search') search?: string,
  ) {
    return this.journalsService.getAllAvailableJournalsOrByIssn({
      issn: issn ?? '',
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      search: search ?? '',
    });
  }

  // GET UNAVAILABLE PERIODICALS WITH/WITHOUT ISSN
  @Get('get-all-unavailable-periodicals') //this returns as many copies of the same journal in copy but one entry in titles
  async getAllUnavailableJournals(
    @Query('_issn') issn?: string,
    @Query('_page') page?: string,
    @Query('_limit') limit?: string,
    @Query('_search') search?: string,
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
    @Query('_search') search?: string,
  ) {
    return this.journalsService.filterByCategory({
      category: category ?? '',
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      search: search ?? '',
    });
  }

  // ---------- PERIODICALS COPY ---------------

  // GET COPY INFORMATION
  @Get('get-periodical-copy-info')
  async getCopyInformation(@Query('_journal_copy_id') journal_copy_id: string) {
    return this.journalsService.getCopyInformation({
      journal_copy_id: journal_copy_id ?? '',
    });
  }

  // GET ALL PERIODICAL COPIES
  @Get('get-all-copies')
  async getAllCopies(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.journalsService.getAllCopies({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      search: search ?? undefined,
    });
  }

  // FIND JOURNAL/MAGAZINE COPY - working
  @Get('find-all-copies')
  async findAllJournalCopyInfo(
    @Query('_journal_copy_id') journal_copy_id?: string,
    @Query('_journal_title') journal_title?: string,
    @Query('_editor_name') editor_name?: string,
    @Query('_issn') issn?: string,
    @Query('_barcode') barcode?: string,
    @Query('_item_type') item_type?: string,
    @Query('_institute_uuid') institute_uuid?: string,
    @Query('_page') page?: string,
    @Query('_limit') limit?: string,
    @Query('_search') search?: string,
  ) {
    return this.journalsService.findAllJournalCopyInfo({
      journal_copy_id: journal_copy_id ?? '',
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

  // FIND JOURNAL FROM COPY BY JOURNAL TITLE UUID
  @Get('get-periodical-copies') //enter title id and get periodical copy information - use this
  async fetchSingleJournalCopyInfo(
    @Query('_journal_title_id') journal_title_id?: string,
    @Query('_page') page?: string,
    @Query('_limit') limit?: string,
    @Query('_search') search?: string,
  ) {
    return this.journalsService.getSingleJournalCopyInfo({
      journal_title_id: journal_title_id ?? '',
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      search: search ?? '',
    });
  }
  // async fetchSingleJournalCopyInfo( //enter journal uuid and get periodical copy information
  //     @Query('_journal_title_uuid') journal_title_uuid?: string,
  //     @Query('_page') page?: string,
  //     @Query('_limit') limit?: string,
  //     @Query('_search') search?: string
  // ) {
  // return this.journalsService.getSingleJournalCopyInfo({
  //     journal_title_uuid: journal_title_uuid ?? '',
  //     page: page ? parseInt(page, 10) : 1,
  //     limit: limit ? parseInt(limit, 10) : 10,
  //     search: search ?? '',
  // });
  // }

  // EDIT COPIES
  @Patch('update-periodical-copies')
  @UsePipes(new bodyValidationPipe(updatePeriodicalSchema))
  async editPeriodicalCopies(
    @Body() updatePeriodicalPayload: TUpdatePeriodicalDTO,
  ) {
    try {
      const result = await this.journalsService.updatePeriodicalCopy(
        updatePeriodicalPayload,
      );
      return result;
    } catch (error) {
      if (!(error instanceof HttpException)) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw error;
    }
  }

  // ARCHIVE PERIODICAL COPY
  @Put('archive-periodical-copy')
  async archivePeriodicalCopy(
    @Body('journal_copy_id') journal_copy_id: string,
  ) {
    return this.journalsService.archivePeriodicalCopy(journal_copy_id);
  }

  // RESTORE PERIODICAL COPY
  @Put('restore-periodical-copy')
  async restoreJournalCopy(@Body('journal_copy_id') journal_copy_id: string) {
    return this.journalsService.restorePeriodicalCopy(journal_copy_id);
  }

  // BULK DELETE

  // ------------------- PERIODICAL LOGS ---------------------

  //  GET ALL LOGS
  @Get('get-periodical-logs')
  async getPeriodicalLogs(
    @Query('_page') page?: string,
    @Query('_limit') limit?: string,
    @Query('_search') search?: string,
  ) {
    return this.journalsService.getPeriodicalLogs({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      search: search ?? '',
    });
  }

  // SEARCH PERIODICAL LOGS FROM PERIODICAL COLUMNS
  // Note : Not implemented in frontend
  @Get('search-periodical-logs')
  async searchJournalsByID(
    @Query('_journal_title_id') journal_title_id?: string,
    @Query('_journal_copy_uuid') journal_copy_uuid?: string,
    @Query('_journal_log_uuid') journal_log_uuid?: string,
    @Query('_action') action?: string,
    @Query('_description') description?: string,
    @Query('_issn') issn?: string,
    @Query('_ip_address') ip_address?: string,
    @Query('_borrower_uuid') borrower_uuid?: string,
    @Query('_page') page?: string,
    @Query('_limit') limit?: string,
    @Query('_search') search?: string,
  ) {
    return this.journalsService.searchJournalsByID({
      journal_title_id: journal_title_id ?? '',
      journal_copy_uuid: journal_copy_uuid ?? '',
      journal_log_uuid: journal_log_uuid ?? '',
      action: action ?? '',
      description: description ?? '',
      issn: issn ?? '',
      ip_address: ip_address ?? '',
      borrower_uuid: borrower_uuid ?? '',
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      search: search ?? '',
    });
  }

  // CREATE PERIODICAL LOGS
  @Post('create-periodical-log')
  @UsePipes(new bodyValidationPipe(journalLogsSchema))
  // async createPeriodicalLog(
  //   @Body() journalLogPayload: TCreateJournalLogDTO,
  //   @Req() request: Request,
  // ) {
  //   try {
  //     let status: 'borrowed' | 'returned' | 'in_library_borrowed' | undefined =
  //       undefined;
  //     let result: Record<string, string | number> = {};
  //     if (journalLogPayload.action === 'borrow') {
  //       return await this.journalsService.periodicalBorrowed(
  //         journalLogPayload,
  //         request,
  //         (status = 'borrowed'),
  //       );
  //     } else if (journalLogPayload.action === 'return') {
  //       return await this.journalsService.periodicalReturned(
  //         journalLogPayload,
  //         request,
  //         (status = 'returned'),
  //       );
  //     } else {
  //       return await this.journalsService.periodicalBorrowed(
  //         journalLogPayload,
  //         request,
  //         (status = 'in_library_borrowed'),
  //       );
  //     }
  //     // return result;
  //   } catch (error) {
  //     if (!(error instanceof HttpException)) {
  //       throw new HttpException(
  //         error.message,
  //         HttpStatus.INTERNAL_SERVER_ERROR,
  //       );
  //     }
  //     throw error;
  //   }
  // }

  // BULK DELETE
  @Delete('bulk-delete-for-periodical-copies')
  @UsePipes(
    new bulkBodyValidationPipe<
      TPeriodicalCopyIdDTO,
      {
        validated_array: TPeriodicalCopyIdDTO[];
        invalid_data_count: number;
      }
    >('journals/bulk-delete-for-periodical-copies'),
  )
  async bulkDeletePeriodicalCopies(
    @Body()
    arrCopyUUIDPayload: {
      validated_array: TPeriodicalCopyIdDTO[];
      invalid_data_count: number;
    },
  ) {
    try {
      const result = await this.journalsService.bulkDeletePeriodicalCopies(
        arrCopyUUIDPayload.validated_array,
      );
      return result;
    } catch (error) {
      if (!(error instanceof HttpException)) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      } else {
        throw error;
      }
    }
  }

  // get journal logs from journal_log_uuid or issn number
  // @Get('get-journal-logs-by-title') --WORKING IN get-periodical-logs
  // async getJournalLogDetailsByTitle(
  //     @Query('journal_log_uuid') journal_log_uuid: string,
  //     @Query('_issn') issn: string,
  // ) {
  //     return this.journalsService.getJournalLogDetailsByTitle({
  //         journal_log_uuid,
  //         issn,
  //     });
  // }

  // @Get('get-logs-by-copy') --NOT NEEDED
  // async getJournalLogDetailsByCopy(@Query('_barcode') barcode: string) {
  //     return this.journalsService.getJournalLogDetailsByCopy({
  //         barcode,
  //     });
  // }

  // @Get('get_available_by_issn') -- WORKING IN GET FUNCTION FOR TITLES TABLE
  // async getAvailableJournalByIssn(
  //     @Query('_issn') issn: string,
  // ) {
  //     return this.journalsService.getAvailableJournalByIssn(issn);
  // }

  // @Get('get_unavailable_by_issn') -- WORKING IN GET FUNCTION FOR TITLES TABLE
  // async getUnavailableJournalByIssn(
  //     @Query('_issn') issn: string,
  // ) {
  //     return this.journalsService.getUnavailableJournalByIssn(issn);
  // }

  // @Get('issn') -- WORKING IN GET FUNCTION FOR TITLES TABLE
  // async searchJournalIssn(@Query('_issn') issn: string) {
  //     try {
  //         const result = await this.journalsService.searchJournalIssn(issn);
  //         return result[0];
  //     } catch (error) {
  //         throw new HttpException(error.message, HttpStatus.NOT_FOUND);
  //     }
  // }

  // @Get('all_archived') -- WORKING IN GET FUNCTION FOR TITLES TABLE
  // async getAllArchivedJournals(
  //     @Query('_page') page: string,
  //     @Query('_limit') limit: string,
  //     @Query('_search') search: string,
  // ) {
  //     return this.journalsService.getArchivedJournals({
  //         page: page ? parseInt(page, 10) : 1,
  //         limit: limit ? parseInt(limit, 10) : 10,
  //         search: search ?? undefined,
  //     });
  // }

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

  @Patch('update_journal_copy') // maybe redundant code: already made another function
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

  // ISSUE PERIODICALS NEW FUNCTIONS

  @Post('issue')
  @UsePipes(new bodyValidationPipe(issueLogSchema))
  async issue(
    @Body() issuePayload: TCreateJournalLogDTO,
    @Req() request: Request,
  ) {
    try {
      let status: 'borrowed' | 'returned' | 'in_library_borrowed' | undefined =
        undefined;
      let result: Record<string, string | number> = {};

      let category = '';

      // check the category of the input if exists->category="book/periodical" else->category="does_not_exist"
      if (/^[A-Z]+\d+-\d+$/.test(issuePayload.copy_id)) {
        category = 'periodical';
      } else if (/^[A-Z]+\d/.test(issuePayload.copy_id)) {
        category = 'book';
      } else {
        return { message: 'Invalid ID' };
      }

      if (category === 'book' && issuePayload.action === 'borrow') {
        return "all book borrowed from bookServices"
      } else if (category === 'book' && issuePayload.action === 'return') {
        return 'all book returned from booksServices';
      } else if (category === 'periodical' && issuePayload.action === 'borrow' ) {
        return await this.journalsService.periodicalBorrowed(
          issuePayload,
          request,
          (status = 'borrowed'),
          (category = category),
        );
      } else if (category === 'periodical' && issuePayload.action === 'return') {
        return await this.journalsService.periodicalReturned(
          issuePayload,
          request,
          (status = 'returned'),
          (category = category),
        );
      }
    } catch (error) {
      if (!(error instanceof HttpException)) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw error;
    }
  }
}
