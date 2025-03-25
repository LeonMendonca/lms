import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Delete,
  Query,
  UsePipes,
  HttpException,
  HttpStatus,
  ParseUUIDPipe,
  Patch,
  Req,
} from '@nestjs/common';
import { BooksV2Service } from './books_v2.service';
import { bodyValidationPipe } from 'src/pipes/body-validation.pipe';
import { createBookSchema, TCreateBookZodDTO } from './zod/createbookdtozod';
import { TUpdatebookZodDTO } from './zod/updatebookdto';
import type { Request } from 'express';
import {
  booklogSchema,
  TCreateBooklogDTO,
} from 'src/book_log/zod/createbooklog';
import { TupdatearchiveZodDTO } from './zod/uarchive';
import { TRestoreZodDTO } from './zod/restorearchive';
import { TCopyarchiveZodDTO } from './zod/archivebookcopy';
import { TRestorecopybookZodDTO } from './zod/restorebookcopies';
import { TUpdatebookcopyZodDTO } from './zod/updatebookcopy';
import {
  booklogV2Schema,
  TCreateBooklogV2DTO,
} from './zod/create-booklogv2-zod';
import { TUpdateInstituteZodDTO } from './zod/updateinstituteid';
import {
  TUpdateFeesPenaltiesZod,
  updateFeesPenaltiesZod,
} from './zod/update-fp-zod';
import { bulkBodyValidationPipe } from 'src/pipes/bulk-body-validation.pipe';
import { bookUUIDZod, TbookUUIDZod } from './zod/bookuuid-zod';
import { requestBookZodIssue, requestBookZodIssueReIssueAR, requestBookZodReIssue } from './zod/requestbook-zod';
import type { TRequestBookZodIssue, TRequestBookZodIssueReIssueAR, TRequestBookZodReIssue } from './zod/requestbook-zod'

@Controller('book_v2')
export class BooksV2Controller {
  constructor(private readonly booksService: BooksV2Service) {}

  // Get all books
  @Get('all')
  async getAllBooks(
    @Query('_page') page: string,
    @Query('_limit') limit: string,
    @Query('_search') search: string,
  ) {
    console.log(page, limit, search);
    return this.booksService.getBooks({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      search: search ?? undefined,
    });
  }

  @Get('get_copies_with_title')
  async getBookCopiesByTitle(
    @Query('_book_uuid') book_uuid: string,
    @Query('_isbn') isbn: string,
    @Query('_titlename') titlename: string,
    @Query('_page') page: string = '1',
    @Query('_limit') limit: string = '10',
  ) {
    return this.booksService.getBookCopiesByTitle({
      book_uuid,
      isbn,
      titlename,
      page:page ?parseInt(page,10):1,
      limit:limit ?parseInt(limit,10):10, 
    });
  }

  @Get('get_logs_of_title')
  async getLogDetailsByTitle(
    @Query('_book_title_id') book_title_id: string,
    @Query('_isbn') isbn: string,
    @Query('_page') page: string,
    @Query('_limit') limit: string,

  ) {
    try {
      return await this.booksService.getLogDetailsByTitle({
        book_title_id,
        isbn,
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 10,
      });
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

  @Get('get_logs_of_copy')
  async getLogDetailsByCopy(
    @Query('_barcode') barcode: string,
    @Query('_page') page: string,
    @Query('_limit') limit: string

  ) {
    try {
      return await this.booksService.getLogDetailsByCopy({
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 10,
        barcode,
      });
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

  @Get('get_logs_of_student')
  async getLogDetailsOfStudent(
    @Query('_student_id') student_id: string,
    @Query('_page') page: string = '1',
    @Query('_limit') limit: string = '10',
  ) {
    try {
      return await this.booksService.getLogDetailsOfStudent({
        student_id,
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 10,
      }); 
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

  @Get('get_all_available') // working
  async getAllAvailableBooks( 
    @Query('_page') page: string,
  @Query('_limit') limit: string) {
    return await this.booksService.getAllAvailableBooks(
      {
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 10,
      }
    );
  }

  @Get('get_available_by_isbn') // working// pagination
  async getavailablebookbyisbn(
    @Query('_isbn') isbn: string,
    @Query('_page') page: string = '1',
    @Query('_limit') limit: string = '10',
) {
    try {
      return await this.booksService.getavailablebookbyisbn({
        isbn,
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 10        
      }
      );
    } catch (error) {
      if(!(error instanceof HttpException)){
        throw new HttpException(error.message,HttpStatus.BAD_GATEWAY);
      }
      throw error

    }
  }

  @Get('get_all_unavailable') // working
  async getAllUnavailableBooks(
    @Query('_page') page: string,
    @Query('_limit') limit: string
  ) {
    return await this.booksService.getAllUnavailableBooks(
      {
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 10,
      }
    );
  }

  @Get('get_unavailable_by_isbn') // working // pagination
  async getunavailablebookbyisbn(
    @Query('_isbn') isbn: string,
    @Query('_page') page: string,
    @Query('_limit') limit: string
  ) {
    try {
      return await this.booksService.getunavailablebookbyisbn({
        isbn,
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 10
      }  );
    } catch (error) {
      if(!(error instanceof HttpException)){
        throw new HttpException(error.message,HttpStatus.BAD_GATEWAY);
      }
      throw error
    }
  }

  // @Get('isarchiveT')
  // async AllBooksArchiveTrue() {
  //   return this.booksService.getBooks();
  // }

  // @Put('uparchive')
  // async updateArchive(@Body('book_uuid') book_uuid: string) {
  //   console.log('working');
  //   return this.booksService.updateTitleArchive(book_uuid);
  // }

  @Put('uparchive') //  working
  async updateArchive(@Body() creatbookpayload: TupdatearchiveZodDTO) {
    return this.booksService.updateTitleArchive(creatbookpayload);
  }

  // @Get('search')
  // //@UsePipes(new QueryValidationPipe(bookQuerySchema)) // Ensure the schema is passed correctly
  // async getBookBy(@Query() query: UnionBook) {
  //   const result = await this.booksService.findBookBy(query);

  //   if (result) {
  //     return result;
  //   } else {
  //     throw new HttpException('No book found', HttpStatus.NOT_FOUND);
  //   }}//see query for nestjs
  @Get('isbn') // update by insert query helper or create  own query helper for select part// not working
  async searchBookIsbn(@Query('_isbn') isbn: string) {
    try {
      const result = await this.booksService.isbnBook(isbn);
      return result;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  // Create new book
  @Post('create') // working
  @UsePipes(new bodyValidationPipe(createBookSchema))
  async createBook(@Body() bookPayload: TCreateBookZodDTO) {
    try {
      const result = await this.booksService.createBook(bookPayload);
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

  //@Post('bulk-create')
  //@UsePipes(new bulkBodyValidationPipe())

  @Delete('bulk-delete')
  @UsePipes(new bulkBodyValidationPipe<TbookUUIDZod>('book/book-zod-uuid-worker'))
  async bulkDelte(@Body() arrBookUUIDPayload: TbookUUIDZod[]) {
    try {
      return this.booksService.bulkDelete(arrBookUUIDPayload);
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

  @Get('all_archived') // working
  async getAllArchivedBooks(
    @Query('_page') page: string,
    @Query('_limit') limit: string,
    @Query('_search') search: string,
  ) {
    return await this.booksService.getArchivedBooks({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      search: search ?? undefined,
    });
  }

  @Get('get_all_logs') // pending
  async getLogDetails(
    @Query('_page') page: string,
    @Query('_limit') limit: string,
  ) {
    try {
      return await this.booksService.getLogDetails({
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 10,
      });
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

  @Put('restore_archive')
  async restoreArchive(
    @Body('book_uuid', new ParseUUIDPipe()) book_uuid: string,
  ) {
    return await this.booksService.restoreBook(book_uuid);
  }

  @Get('get_book_title_details') // not working
  async getBookTitleDetails(
    @Query('_book_uuid') book_uuid: string,
    @Query('_isbn') isbn: string,
    @Query('_titlename') titlename: string,
  ) {
    return await this.booksService.getBookTitleDetails({
      book_uuid: book_uuid ?? undefined,
      isbn: isbn ?? undefined,
      titlename: titlename ?? undefined,
    });
  }

  @Get('get_all_book_copy') // working
  async fetchAllCopyInfo(
    @Query('_page') page: string,
    @Query('_limit') limit: string,
  ) {
    return await this.booksService.getBookCopies({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
    });
  }

  @Get('get_book_copy') // what is the use of identifier?? working//
  async fetchSingleCopyInfo(@Query('_identifier') identifier: string) {
    return await this.booksService.getSingleCopyInfo(identifier);
  }

  @Patch('update_book_title') //working
  async updateBookTitle(
    @Body('book_uuid') book_uuid: string,
    @Body() bookPayload: TUpdatebookZodDTO,
  ) {
    return await this.booksService.updateBookTitle(book_uuid, bookPayload);
  }

  @Put('archive_book_copy')
  async archiveBookCopy(
    @Body('book_copy_uuid', new ParseUUIDPipe()) book_copy_uuid: string,
  ) {
    try {
      return await this.booksService.archiveBookCopy(book_copy_uuid);
    } catch (error) {
      if(!(error instanceof HttpException)){
        throw new HttpException(error.message,HttpStatus.BAD_GATEWAY);
      }
      throw error
    }
  }

  @Get('get_archived_book_copy') //working
  async getArchivedBooksCopy(
    @Query('_page') page: string,
    @Query('_limit') limit: string,
  ) {
    return await this.booksService.getArchivedBooksCopy({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
    });
  }

  @Put('restore_book_copy')
  async restoreBookCopy(@Body('book_uuid') book_uuid: string) {
    return await this.booksService.restoreBookCopy(book_uuid);
  }

  @Patch('update_book_copy') // wait
  async updateBookCopy(
    @Body('book_copy_uuid') book_uuid: string,
    @Body() bookPayload: TUpdatebookcopyZodDTO,
  ) {
    return await this.booksService.updateBookCopy(book_uuid, bookPayload);
  }

  @Get('available') // wait
  async availableBook(
    @Query('isbn') isbn: string,
    @Query('_page') page: string,
    @Query('_limit') limit: string,
  ) {
    return await this.booksService.getavailablebookbyisbn({
      isbn,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
    
    });
  }

  //logs part

  //@Post('borrowed')
  //@UsePipes(new bodyValidationPipe(booklogV2Schema))
  //async createBooklogBorrowed(
  //  @Body() booklogPayload: TCreateBooklogV2DTO,
  //  @Req() request: Request
  //) {
  //  try {
  //    return await this.booksService.createBookBorrowed(
  //      booklogPayload, request
  //    );
  //  } catch (error) {
  //    if(!(error instanceof HttpException)) {
  //      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
  //    }
  //    throw error;
  //  }
  //}

  @Post('library')
  @UsePipes(new bodyValidationPipe(booklogSchema))
  async setbooklibrary(
    @Body() booklogpayload: TCreateBooklogV2DTO,
    @Req() req: Request,
  ) {
    try {
      // Extract user IP address properly
      const ipAddress =
        req.headers['x-forwarded-for']?.[0] ||
        req.socket.remoteAddress ||
        'Unknown';

      const result = await this.booksService.setbooklibrary(
        booklogpayload,
        ipAddress,
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'Book borrowed successfully',
        data: result,
      };
    } catch (error) {
      console.error('Error in createBooklogIssued:', error);
      throw new HttpException(
        error.message || 'Failed to borrow book',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //Implements Borrow and Return
  @Post('update-book-log')
  @UsePipes(new bodyValidationPipe(booklogV2Schema))
  async updateBookLog(
    @Body() booklogPayload: TCreateBooklogV2DTO,
    @Req() request: Request,
  ) {
    try {
      if (!request.ip) {
        throw new HttpException(
          'Unable to get IP address of the Client',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      let status: 'borrowed' | 'returned' | 'in_library_borrowed' | undefined = undefined;
      let result: Record<string, string | number> = {};
      if (booklogPayload.action === 'borrow') {
        result = await this.booksService.bookBorrowed(
          booklogPayload,
          request.ip,
          (status = 'borrowed'),
        );
      } else if (booklogPayload.action === 'return') {
        result = await this.booksService.bookReturned(
          booklogPayload,
          request.ip,
          (status = 'returned'),
        );
      } else {
        result = await this.booksService.bookBorrowed(
          booklogPayload,
          request.ip,
          (status = 'in_library_borrowed'),
        );
      }
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
  //       @Post('booklibrary')
  //       async setBooktoLibrary(@Body() booklogpayload:TCreateBooklogDTO){
  // try {
  //    const result= await this.BooklogService.setbooklibrary(booklogpayload)
  // } catch (error) {

  // }
  //       }

  //fees and penalties

  // to get pending fees for single student
  // @Get("pending_fees")
  // async pendingFees(
  //   @Query('_student_id') student_id: string,
  // ){
  //   try {
  //     // await this.booksService.pendingfees_and_penalties(student_id)
  //   } catch (error) {
  //   }
  // }

  @Put('pay_student_fee')
  @UsePipes(new bodyValidationPipe(updateFeesPenaltiesZod))
  async payStudentFee(@Body() feesPayload: TUpdateFeesPenaltiesZod) {
    try {
      return await this.booksService.payStudentFee(feesPayload);
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
  @Get('get_student_fee')
  async getStudentFeeHistory(
    @Query('_student_id') studentId: string,
    @Query('_ispenalised') isPenalty: boolean,
    @Query('_iscompleted') isCompleted: boolean,
  ) {
    try {
      if (studentId) {
        return await this.booksService.getStudentFee(
          studentId,
          isPenalty,
          isCompleted,
        );
      } else if (isPenalty) {
        return await this.booksService.getStudentFee(
          studentId,
          isPenalty,
          isCompleted,
        );
      } else if (isCompleted) {
        return await this.booksService.getStudentFee(
          studentId,
          isPenalty,
          isCompleted,
        );
      }
    } catch (error) {
      if (!(error instanceof HttpException)) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      throw error;
    }
  }
  @Get('get_full_feelist')
  async getFullFeeList(
    @Query('_page') page: string,
    @Query('_limit') limit: string,
  ) {
    try {
      return await this.booksService.getFullFeeList({
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 10
      } 
      );
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

  @Get('get_full_feelist_student')
  async getFullFeeListStudent() {
    try {
      return await this.booksService.getFullFeeListStudent();
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

  @Get('generate_fee_report')
  async generateFeeReport(
    @Query('start') start: Date,
    @Query('end') end: Date,
     @Query('_page') page: string,
     @Query('_limit') limit: string,
  ) {
    try {
      return await this.booksService.generateFeeReport(start,
         end,
        page ? parseInt(page, 10) : 1,
        limit ? parseInt(limit, 10) : 10
        );
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

  //REQUEST BOOK

  @Get('request_booklog')
  async getRequestBooklog() {}

  @Post('request_booklog_issue')
  @UsePipes(new bodyValidationPipe(requestBookZodIssue))
  async createRequestBooklogIssue(@Body() requestBookIssuePayload: TRequestBookZodIssue, @Req() request: Request) {
    try {
      if(!request.ip) {
        throw new HttpException(
          'Unable to get IP address of the Client',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      //Adding IP address, since required for issuing
      return await this.booksService.createRequestBooklogIssue(requestBookIssuePayload, request.ip);
    } catch (error) {
      if(!(error instanceof HttpException)) {
        throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
      throw error;
    }
  }

  //Approve or Reject for Issue
  @Post('request_booklog_issue_ar')
  @UsePipes(new bodyValidationPipe(requestBookZodIssueReIssueAR))
  async createRequestBooklogIssueAR(@Body() requestBookIssueARPayload: TRequestBookZodIssueReIssueAR) {
    try {
      return await this.booksService.createRequestBooklogIssueAR(requestBookIssueARPayload);
    } catch (error) {
      if(!(error instanceof HttpException)) {
        throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
      throw error;
    }
  }

  @Post('request_booklog_reissue')
  @UsePipes(new bodyValidationPipe(requestBookZodReIssue))
  async createRequestBooklogReIssue(@Body() requestBookReIssuePayload: TRequestBookZodReIssue) {
    try {
    } catch (error) {
      if(!(error instanceof HttpException)) {
        throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
      throw error;
    }
  }

  //Approve or Reject for ReIssue
  @Post('request_booklog_reissue_ar')
  @UsePipes(new bodyValidationPipe(requestBookZodIssueReIssueAR))
  async createRequestBooklogReIssueAR(@Body() requestBookIssueARPayload: TRequestBookZodIssueReIssueAR) {
    try {
    } catch (error) {
      if(!(error instanceof HttpException)) {
        throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
      throw error;
    }
  }


}
