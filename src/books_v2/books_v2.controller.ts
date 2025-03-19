import {
  Controller,
  Get,
  Post,
  Body,
  Put,
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
import { booklogV2Schema, TCreateBooklogV2DTO } from './zod/create-booklogv2-zod';
import { TUpdateInstituteZodDTO } from './zod/updateinstituteid';

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
    @Query('_book_title_id') book_title_id: string,
    @Query('_isbn') isbn: string,
    @Query('_titlename') titlename: string,
  ) {
    return this.booksService.getBookCopiesByTitle({
      book_title_id,
      isbn,
      titlename,
    });
  }

  @Get('get_logs_of_title')
  async getLogDetailsByTitle(
    @Query('_book_title_id') book_title_id: string,
    @Query('_isbn') isbn: string,
  ) {
    try {
      return await this.booksService.getLogDetailsByTitle({book_title_id, isbn}); 
    } catch (error) {
      if(!(error instanceof HttpException)) {
        throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
      throw error;
    }
  }

  @Get('get_logs_of_copy')
  async getLogDetailsByCopy(@Query('_barcode') barcode: string) {
    try {
      return await this.booksService.getLogDetailsByCopy({
        barcode,
      }); 
    } catch (error) {
      if(!(error instanceof HttpException)) {
        throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
      throw error;
    }
  }

  @Get('get_logs_of_student')
  async getLogDetailsOfStudent(@Query('_student_id') studentId: string) {
    try {
      return await this.booksService.getLogDetailsOfStudent(studentId);
    } catch (error) {
      if(!(error instanceof HttpException)) {
        throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
      throw error;
    }
  }

  @Get('get_all_available')// working
  async getAllAvailableBooks() {
    try {
      return await this.booksService.getAllAvailableBooks();
    } catch (error) {
      if(!(error instanceof HttpException)) {
        throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
      throw error;
    }
  }

  @Get('get_available_by_isbn')// working 
  async getavailablebookbyisbn(
    @Query('_isbn') isbn: string,
  ) {
    try {
      return await this.booksService.getunavailablebookbyisbn(isbn);
    } catch (error) {
      if(!(error instanceof HttpException)) {
        throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
      throw error;
    }
  }

  @Get('get_all_unavailable')// working
  async getAllUnavailableBooks() {
    try {
      return await this.booksService.getAllUnavailableBooks();
    } catch (error) {
      if(!(error instanceof HttpException)) {
        throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
      throw error;
    }
  }

  @Get('get_unavailable_by_isbn')// working
  async getunavailablebookbyisbn(
    @Query('_isbn') isbn: string,
  ) {
 try {
  return await this.booksService.getunavailablebookbyisbn(isbn);
 } catch (error) {
  if(!(error instanceof HttpException)) {
    throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
  throw error;
 }
  }


  @Put('uparchive')//  working
  async updateArchive(@Body() creatbookpayload:TupdatearchiveZodDTO) {
      try {
        return this.booksService.updateTitleArchive(creatbookpayload);
      } catch (error) {
        if(!(error instanceof HttpException)) {
          throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
        throw error;
      }
  }

  @Get('isbn')// update by insert query helper or create  own query helper for select part// working
  async searchBookIsbn(@Query('_isbn') isbn: string) {
    try {
      const result = await this.booksService.isbnBook(isbn);
      return result[0];
    } catch (error) {
      if(!(error instanceof HttpException)) {
        throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
      throw error;
        }
  }

  // Create new book
  @Post('create')// working
  @UsePipes(new bodyValidationPipe(createBookSchema))
  async createBook(@Body() bookPayload: TCreateBookZodDTO) {
    try {
      const result = await this.booksService.createBook(bookPayload);
      return result;
    } catch (error) {
      if(!(error instanceof HttpException)) {
        throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
      throw error;
    }
  }

  @Get('all_archived')// working
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
    return await this.booksService.getLogDetails({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
    });
  }

  @Put('restore_archive')// copies part is not restored// working
  async restoreArchive(@Body('book_title_id', ) book_title_id: string) {
   try {
    return await this.booksService.restoreBook(book_title_id);
   } catch (error) {
    if(!(error instanceof HttpException)) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    throw error;
   }
  }
  



  @Get('get_book_title_details')// not working 
  async getBookTitleDetails(
    @Query('_book_title_id') book_title_id: string,
    @Query('_isbn') isbn: string,
    @Query('_titlename') titlename: string,
  ) {
    return await this.booksService.getBookTitleDetails({
      book_title_id: book_title_id ?? undefined,
      isbn: isbn ?? undefined,
      titlename: titlename ?? undefined,
    });
  }


  ////   stop for personal work
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

  @Get('get_book_copy')// what is the use of identifier?? working//
  async fetchSingleCopyInfo(@Query('_identifier') identifier: string) {
   try {
    return await this.booksService.getSingleCopyInfo(identifier);
   } catch (error) {
    if(!(error instanceof HttpException)) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    throw error;
   }
  }

  @Patch('update_book_title')//working
  async updateBookTitle(
    @Body('book_title_id') book_title_id: string,
    @Body() bookPayload: TUpdatebookZodDTO,
  ) {
    try {
      return await this.booksService.updateBookTitle(book_title_id, bookPayload);

    } catch (error) {
      if(!(error instanceof HttpException)) {
        throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
      throw error;
    }
  }

  @Put('archive_book_copy')
  async archiveBookCopy(@Body('book_copy_id') book_copy_id: string) {
    try {
      return await this.booksService.archiveBookCopy(book_copy_id);
    } catch (error) {
      if(!(error instanceof HttpException)) {
        throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
      throw error;
    }}
  @Get('get_archived_book_copy')//working
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
  async restoreBookCopy(@Body('book_copy_id') book_copy_id: string) {
   try {
   return await this.booksService.restoreBookCopy(book_copy_id);

   } catch (error) {
    if(!(error instanceof HttpException)) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    throw error;
   }
  }
  

  @Patch('update_book_copy')
  async updateBookCopy(
    @Body('book_copy_id') book_copy_id: string,
    @Body() bookPayload: TUpdatebookcopyZodDTO,
  ) {
   try {
    return await this.booksService.updateBookCopy(book_copy_id, bookPayload);
   } catch (error) {
    if(!(error instanceof HttpException)) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    throw error;
   }
  }

  @Get('available')// wait
  async availableBook(@Query('isbn') isbn: string) {
    return await this.booksService.getavailablebookbyisbn(isbn);
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
      let status: 'borrowed' | 'returned' | 'in_library_borrowed' | undefined = undefined;
      let result: Record<string, string | number> = {};
      if(booklogPayload.action === 'borrow') {
        result = await this.booksService.bookBorrowed(booklogPayload, request, status = 'borrowed');
      } else if (booklogPayload.action === 'return') {
        result = await this.booksService.bookReturned(booklogPayload, request, status = 'returned')
      } else {
        result = await this.booksService.bookBorrowed(booklogPayload, request, status = 'in_library_borrowed');
      }
      return result;
    } catch (error) {
      if(!(error instanceof HttpException)) {
        throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
  //       @Post('booklibrary')
  //       async setBooktoLibrary(@Body() booklogpayload:TCreateBooklogDTO){
  // try {
  //    const result= await this.BooklogService.setbooklibrary(booklogpayload)
  // } catch (error) {

  // }
  //       }
}
