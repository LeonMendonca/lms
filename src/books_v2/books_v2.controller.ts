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
import type { Request } from 'express';
import { UpdateBookTitleDTO } from './zod/updatebookdto';
import {
  booklogSchema,
  TCreateBooklogDTO,
} from 'src/book_log/zod/createbooklog';
import { booklogV2Schema, TCreateBooklogV2DTO } from './zod/create-booklogv2-zod';

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
  ) {
    return this.booksService.getBookCopiesByTitle({
      book_uuid,
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
      return this.booksService.getLogDetailsByCopy({
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
      return this.booksService.getLogDetailsOfStudent(studentId);
    } catch (error) {
      if(!(error instanceof HttpException)) {
        throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
      throw error;
    }
  }

  @Get('get_all_available')
  async getAllAvailableBooks() {
    return this.booksService.getAllAvailableBooks();
  }

  @Get('get_available_by_isbn')
  async getavailablebookbyisbn(
    @Query('_isbn') isbn: string,
  ) {
    return this.booksService.getunavailablebookbyisbn(isbn);
  }

  @Get('get_all_unavailable')
  async getAllUnavailableBooks() {
    return this.booksService.getAllUnavailableBooks();
  }

  @Get('get_unavailable_by_isbn')
  async getunavailablebookbyisbn(
    @Query('_isbn') isbn: string,
  ) {
    return this.booksService.getunavailablebookbyisbn(isbn);
  }

  // @Get('isarchiveT')
  // async AllBooksArchiveTrue() {
  //   return this.booksService.getBooks();
  // }
  @Put('uparchive')
  async updateArchive(@Body('book_uuid') book_uuid: string) {
    console.log('working');
    return this.booksService.updateTitleArchive(book_uuid);
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
  @Get('isbn')
  async searchBookIsbn(@Query('_isbn') isbn: string) {
    try {
      const result = await this.booksService.isbnBook(isbn);
      return result[0];
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  // Create new book
  @Post('create')
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

  @Get('all_archived')
  async getAllArchivedBooks(
    @Query('_page') page: string,
    @Query('_limit') limit: string,
    @Query('_search') search: string,
  ) {
    return this.booksService.getArchivedBooks({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      search: search ?? undefined,
    });
  }

  @Get('get_all_logs')
  async getLogDetails(
    @Query('_page') page: string,
    @Query('_limit') limit: string,
  ) {
    return this.booksService.getLogDetails({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
    });
  }

  @Put('restore_archive')
  async restoreArchive(@Body('book_uuid') book_uuid: string) {
    return this.booksService.restoreBook(book_uuid);
  }

  @Get('get_book_title_details')
  async getBookTitleDetails(
    @Query('_book_uuid') book_uuid: string,
    @Query('_isbn') isbn: string,
    @Query('_titlename') titlename: string,
  ) {
    return this.booksService.getBookTitleDetails({
      book_uuid: book_uuid ?? undefined,
      isbn: isbn ?? undefined,
      titlename: titlename ?? undefined,
    });
  }

  @Get('get_all_book_copy')
  async fetchAllCopyInfo(
    @Query('_page') page: string,
    @Query('_limit') limit: string,
  ) {
    return this.booksService.getBookCopies({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
    });
  }

  @Get('get_book_copy')
  async fetchSingleCopyInfo(@Query('_identifier') identifier: string) {
    return this.booksService.getSingleCopyInfo(identifier);
  }

  @Patch('update_book_title')
  async updateBookTitle(
    @Body('book_uuid') book_uuid: string,
    @Body() bookPayload: UpdateBookTitleDTO,
  ) {
    return this.booksService.updateBookTitle(book_uuid, bookPayload);
  }

  @Put('archive_book_copy')
  async archiveBookCopy(@Body('book_uuid') book_uuid: string) {
    return this.booksService.archiveBookCopy(book_uuid);
  }

  @Get('get_archived_book_copy')
  async getArchivedBooksCopy(
    @Query('_page') page: string,
    @Query('_limit') limit: string,
  ) {
    return this.booksService.getArchivedBooksCopy({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
    });
  }

  @Put('restore_book_copy')
  async restoreBookCopy(@Body('book_uuid') book_uuid: string) {
    return this.booksService.restoreBookCopy(book_uuid);
  }

  @Patch('update_book_copy')
  async updateBookCopy(
    @Body('book_uuid') book_uuid: string,
    @Body() bookPayload: any,
  ) {
    return this.booksService.updateBookCopy(book_uuid, bookPayload);
  }

  @Get('available')
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
}
