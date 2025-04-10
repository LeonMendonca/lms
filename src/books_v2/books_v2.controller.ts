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
  UseGuards,
} from '@nestjs/common';
import { BooksV2Service } from './books_v2.service';
import { bodyValidationPipe } from 'src/pipes/body-validation.pipe';
import { createBookSchema, TCreateBookZodDTO } from './zod/createbookdtozod';
import { TUpdatebookZodDTO } from './zod/updatebookdto';
import type { Request } from 'express';
import {
  booklogSchema,
} from 'src/book_log/zod/createbooklog';
import { TUpdatebookcopyZodDTO } from './zod/updatebookcopy';
import {
  booklogV2Schema,
  TCreateBooklogV2DTO,
} from './zod/create-booklogv2-zod';
import { bulkBodyValidationPipe } from 'src/pipes/bulk-body-validation.pipe';
import {  TbookUUIDZod } from './zod/bookuuid-zod';
import { StudentsService } from 'src/students/students.service';
import { TokenAuthGuard } from '../../utils/guards/token.guard';
import { RequestBook } from './entity/request-book.entity';
import {
  PaginationParserType,
  ParsePaginationPipe,
} from 'src/pipes/pagination-parser.pipe';
import { StudentNotifyService } from 'src/student-notify/student-notify.service';
import { NotificationType } from 'src/student-notify/entities/student-notify.entity';
import { BookTitle } from './entity/books_v2.title.entity';
import { BookCopy } from './entity/books_v2.copies.entity';
import { Booklog_v2 } from './entity/book_logv2.entity';
import { TRequestDTO } from './dto/book-request.dto';
import { TRequestActionDTO } from './dto/book-req-action.dto';

interface AuthenticatedRequest extends Request {
  user?: any; // Ideally, replace `any` with your `User` type
}
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  pagination: {} | null;
  error?: string;
}

@Controller('book_v2')
export class BooksV2Controller {
  constructor(
    private readonly booksService: BooksV2Service,
    private readonly studentService: StudentsService,
    private readonly notifyService: StudentNotifyService,
  ) {}

  @Get()
  async getAllBookTitles(
    @Query(new ParsePaginationPipe()) query: PaginationParserType,
    @Query('_institute_uuid') instituteUuid: string,
  ): Promise<ApiResponse<BookTitle[]>> {
    try {
      const { data, pagination } = await this.booksService.getBooks({
        ...query,
        instituteUuid: JSON.parse(instituteUuid || '[]'),
      });
      return {
        success: true,
        data,
        pagination,
      };
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

  @Get('title') 
  async getBookTitleDetails(
    @Query('_book_uuid') bookUuid: string,
    @Query('_isbn') isbn: string,
    @Query('_titlename') titlename: string,
  ): Promise<ApiResponse<BookTitle>> {
    try {
      const { data, pagination } = await this.booksService.getBookTitleDetails({
        bookUuid: bookUuid ?? undefined,
        isbn: isbn ?? undefined,
        titlename: titlename ?? undefined,
      });
      return {
        data,
        pagination,
        success: true,
      };
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

  @Get('getLogsOfTitle')
  async getLogDetailsByTitle(
    @Query('_book_title_id') book_title_id: string,
    @Query('_isbn') isbn: string,
    @Query('_page') page: string,
    @Query('_limit') limit: string,
  ): Promise<ApiResponse<Booklog_v2[]>> {
    try {
      const { data, pagination } = await this.booksService.getLogDetailsByTitle(
        {
          book_title_id,
          isbn,
          page: page ? parseInt(page, 10) : 1,
          limit: limit ? parseInt(limit, 10) : 10,
        },
      );
      return {
        data,
        pagination,
        success: true,
      };
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

  @Get('copy')
  async getBookCopiesByTitle(
    @Query('_book_uuid') bookUuid: string,
    @Query('_isbn') isbn: string,
    @Query('_titlename') titlename: string,
    @Query(new ParsePaginationPipe()) query: PaginationParserType,
  ): Promise<ApiResponse<BookCopy[]>> {
    try {
      const { data, pagination } = await this.booksService.getBookCopiesByTitle(
        {
          bookUuid,
          isbn,
          titlename,
          ...query,
        },
      );
      return {
        data,
        pagination,
        success: true,
      };
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

  @Get('get_book_copy')
  async fetchSingleCopyInfo(
    @Query('_identifier') identifier: string,
  ): Promise<ApiResponse<BookCopy>> {
    try {
      const { data, pagination } =
        await this.booksService.getSingleCopyInfo(identifier);
      return {
        data,
        pagination,
        success: true,
      };
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
    @Query('_limit') limit: string,
  ): Promise<ApiResponse<Booklog_v2[]>> {
    try {
      const { data, pagination } = await this.booksService.getLogDetailsByCopy({
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 10,
        barcode,
      });
      return {
        data,
        pagination,
        success: true,
      };
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
    @Query('_student_uuid') studentUuid: string,
    @Query('_page') page: string = '1',
    @Query('_limit') limit: string = '10',
  ): Promise<ApiResponse<Booklog_v2[]>> {
    try {
      const { data, pagination } =
        await this.booksService.getLogDetailsOfStudent({
          studentUuid,
          page: page ? parseInt(page, 10) : 1,
          limit: limit ? parseInt(limit, 10) : 10,
        });
      return {
        data,
        pagination,
        success: true,
      };
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

  @Get('isbn') 
  async searchBookIsbn(
    @Query('_isbn') isbn: string,
  ): Promise<ApiResponse<BookTitle>> {
    try {
      const { data, pagination } = await this.booksService.getBookTitleDetails({
        bookUuid: '',
        isbn: isbn,
        titlename: '',
      });
      return {
        data,
        pagination,
        success: true,
      };
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

  @Post('request_book')
  @UseGuards(TokenAuthGuard)
  async createRequestBooklogIssue(
    @Req() request: AuthenticatedRequest,
    @Body() requestBookIssuePayload: TRequestDTO,
  ): Promise<ApiResponse<RequestBook>> {
    try {
      if (!request.ip) {
        throw new HttpException(
          'Unable to get IP address of the Client',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      const user = request.user;
      //Adding IP address, since required for issuing
      const { data, meta } = await this.booksService.createRequestBooklogIssue(
        request.user.studentUuid,
        requestBookIssuePayload,
        request.ip,
      );
      return {
        data,
        pagination: null,
        success: true,
      };
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
  
  @Post('request_book_action')
  async requestBookAction(
    @Body() requestBookIssueARPayload: TRequestActionDTO,
  ): Promise<ApiResponse<{ statusCode: any; message: string }>> {
    try {
      const { data, pagination } = await this.booksService.requestBookAction(
        requestBookIssueARPayload,
      );
      return {
        data,
        pagination,
        success: true,
      };
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
  
  @Get('get_current_borrower_of_student') // done
  async getCurrentBorrowedOfStudent(
    @Query('_student_id') student_id: string,
    @Query('_page') page: string = '1',
    @Query('_limit') limit: string = '10',
  ) {
    try {
      console.log({ student_id });
      const student = await this.studentService.findStudentBy({
        student_id: student_id,
      });
      if (!student) {
        throw new HttpException('Student not found', HttpStatus.NOT_FOUND);
      }
      console.log(student);
      return await this.booksService.getCurrentBorrowedOfStudent({
        student_id: student.student_uuid,
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

  // Create new book
  @Post('create') // working done
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
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw error;
    }
  }

  @Post('bulk-create')
  @UsePipes(
    new bulkBodyValidationPipe<
      TCreateBookZodDTO,
      {
        validated_array: TCreateBookZodDTO[];
        invalid_data_count: number;
      }
    >('book/book-zod-body-worker'),
  )
  async bulkCreate(
    @Body()
    bookZodValidatedObject: {
      validated_array: TCreateBookZodDTO[];
      invalid_data_count: number;
    },
  ) {
    return this.booksService.bulkCreate(bookZodValidatedObject);
  }

  @Delete('bulk-delete')
  @UsePipes(
    new bulkBodyValidationPipe<
      TbookUUIDZod,
      {
        validated_array: TbookUUIDZod[];
        invalid_data_count: number;
      }
    >('book/book-zod-uuid-worker'),
  )
  async bulkDelete(
    @Body()
    bookZodValidatedUUIDObject: {
      validated_array: TbookUUIDZod[];
      invalid_data_count: number;
    },
  ) {
    try {
      return this.booksService.bulkDelete(bookZodValidatedUUIDObject);
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

  @Patch('update_book_title') //working done
  async updateBookTitle(
    @Body('book_uuid') book_uuid: string,
    @Body() bookPayload: TUpdatebookZodDTO,
  ) {
    return await this.booksService.updateBookTitle(book_uuid, bookPayload);
  }

  @Put('archive_book_copy') // done
  async archiveBookCopy(
    @Body('book_copy_uuid', new ParseUUIDPipe()) book_copy_uuid: string,
  ) {
    try {
      return await this.booksService.archiveBookCopy(book_copy_uuid);
    } catch (error) {
      if (!(error instanceof HttpException)) {
        throw new HttpException(error.message, HttpStatus.BAD_GATEWAY);
      }
      throw error;
    }
  }


  @Patch('update_book_copy') // wait
  async updateBookCopy(
    @Body('book_copy_uuid') book_uuid: string,
    @Body() bookPayload: TUpdatebookcopyZodDTO,
  ) {
    return await this.booksService.updateBookCopy(book_uuid, bookPayload);
  }


  //logs part

  // @Post('borrowed')
  // @UsePipes(new bodyValidationPipe(booklogV2Schema))
  // async createBooklogBorrowed(
  //  @Body() booklogPayload: TCreateBooklogV2DTO,
  //  @Req() request: Request
  // ) {
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
  // }

  @Post('library') // done
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
  @Post('update-book-log') // done
  @UsePipes(new bodyValidationPipe(booklogV2Schema))
  async updateBookLog(
    @Body() booklogPayload: TCreateBooklogV2DTO,
    @Req() request: Request,
  ): Promise<ApiResponse<any>> {
    try {
      if (!request.ip) {
        throw new HttpException(
          'Unable to get IP address of the Client',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const action = booklogPayload.action;

      let status: 'borrowed' | 'returned' | 'in_library_borrowed' | undefined =
        undefined;
      let result: any = {};
      if (booklogPayload.action === 'borrow') {
        result = await this.booksService.bookBorrowed(
          booklogPayload,
          request.ip,
          'borrowed',
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

      await this.notifyService.createNotification(
        result.meta.borrower_uuid,
        action === 'borrow' || action === 'in_library'
          ? NotificationType.BOOK_BORROWED
          : NotificationType.BOOK_RETURNED,
        {
          bookTitle: result.meta.new_book_title.book_title,
        },
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

  //REQUEST BOOK

  @Get('request_booklog')
  async getRequestBooklog(
    @Query('_institute_uuid') institute_uuid: string,
    @Query(new ParsePaginationPipe()) query: PaginationParserType,
  ) {
    try {
      return await this.booksService.getRequestBookLogs({
        ...query,
        institute_uuid: JSON.parse(institute_uuid || '[]'),
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

  @Get('student-current-borrows')
  async studentCurrentBooks(@Query('_student_id') student_id: string) {
    try {
      return await this.booksService.studentCurrentBooks(student_id);
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
