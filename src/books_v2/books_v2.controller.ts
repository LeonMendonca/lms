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
import { Request } from 'express';
import { TUpdatebookZodDTO } from './zod/updatebookdto';
import {
  booklogSchema,
  TCreateBooklogDTO,
} from 'src/book_log/zod/createbooklog';
import { TupdatearchiveZodDTO } from './zod/uarchive';
import { TRestoreZodDTO } from './zod/restorearchive';
import { TCopyarchiveZodDTO } from './zod/archivebookcopy';
import { TRestorecopybookZodDTO } from './zod/restorebookcopies';
import { TUpdatebookcopyZodDTO } from './zod/updatebookcopy';

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

  @Get('get_copies_with_title')// workiing add book uuid here
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

  @Get('get_logs_of_title')// pending
  async getLogDetailsByTitle(
    @Query('_book_uuid') book_uuid: string,
    @Query('_isbn') isbn: string,
  ) {
    return this.booksService.getLogDetailsByTitle({
      book_uuid,
      isbn,
    });
  }

  @Get('get_logs_of_copy')// pending
  async getLogDetailsByCopy(@Query('_barcode') barcode: string) {
    return this.booksService.getLogDetailsByCopy({
      barcode,
    });
  }

  @Get('get_all_available')// working
  async getAllAvailableBooks() {
    return this.booksService.getAllAvailableBooks();
  }

  @Get('get_available_by_isbn')// working 
  async getavailablebookbyisbn(
    @Query('_isbn') isbn: string,
  ) {
    return this.booksService.getavailablebookbyisbn(isbn);
  }

  @Get('get_all_unavailable')// working
  async getAllUnavailableBooks() {
    return this.booksService.getAllUnavailableBooks();
  }

  @Get('get_unavailable_by_isbn')// working
  async getunavailablebookbyisbn(
    @Query('_isbn') isbn: string,
  ) {
    return this.booksService.getunavailablebookbyisbn(isbn);
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

  @Put('uparchive')//  working
  async updateArchive(@Body() creatbookpayload:TupdatearchiveZodDTO) {
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
  @Get('isbn')// update by insert query helper or create  own query helper for select part// working
  async searchBookIsbn(@Query('_isbn') isbn: string) {
    try {
      const result = await this.booksService.isbnBook(isbn);
      return result[0];
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
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
    return this.booksService.getArchivedBooks({
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
    return this.booksService.getLogDetails({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
    });
  }

  @Put('restore_archive')//working
  async restoreArchive(@Body() createbookpayload:TRestoreZodDTO) {
    return this.booksService.restoreBook(createbookpayload);
  }

  @Get('get_book_title_details')// not working 
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

  @Get('get_all_book_copy') // working
  async fetchAllCopyInfo(
    @Query('_page') page: string,
    @Query('_limit') limit: string,
  ) {
    return this.booksService.getBookCopies({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
    });
  }

  @Get('get_book_copy')// what is the use of identifier?? working//
  async fetchSingleCopyInfo(@Query('_identifier') identifier: string) {
    return this.booksService.getSingleCopyInfo(identifier);
  }

  @Patch('update_book_title')//working
  async updateBookTitle(
    @Body('book_uuid') book_uuid: string,
    @Body() bookPayload: TUpdatebookZodDTO,
  ) {
    return this.booksService.updateBookTitle(book_uuid, bookPayload);
  }

  @Put('archive_book_copy')//working
  async archiveBookCopy(@Body() createbookcopypayload:TCopyarchiveZodDTO) {
    return this.booksService.archiveBookCopy(createbookcopypayload);
  }

  @Get('get_archived_book_copy')//working
  async getArchivedBooksCopy(
    @Query('_page') page: string,
    @Query('_limit') limit: string,
  ) {
    return this.booksService.getArchivedBooksCopy({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
    });
  }

  @Put('restore_book_copy')// working
  async restoreBookCopy(@Body() createbookcopypayload:TRestorecopybookZodDTO) {
    return this.booksService.restoreBookCopy(createbookcopypayload);
  }

  @Patch('update_book_copy')// wait
  async updateBookCopy(
    @Body('book_copy_uuid') book_uuid: string,
    @Body() bookPayload: TUpdatebookcopyZodDTO,
  ) {
    return this.booksService.updateBookCopy(book_uuid, bookPayload);
  }

  @Get('available')// wait
  async availableBook(@Query('isbn') isbn: string) {
    return await this.booksService.getavailablebookbyisbn(isbn);
  }

  //logs part

  @Post('borrowed')
  @UsePipes(new bodyValidationPipe(booklogSchema))
  async createBooklogIssued(
    @Body() booklogpayload: TCreateBooklogDTO,
    @Req() req: Request,
  ) {
    try {
      // Extract user IP address properly
      const ipAddress =
        req.headers['x-forwarded-for']?.[0] ||
        req.socket.remoteAddress ||
        'Unknown';

      const result = await this.booksService.createBookborrowed(
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

  @Post('library')
  @UsePipes(new bodyValidationPipe(booklogSchema))
  async setbooklibrary(
    @Body() booklogpayload: TCreateBooklogDTO,
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

  @Post('returned')
  async createBooklogreturned(
    @Body() booklogpayload: TCreateBooklogDTO,
    @Req() req: Request,
  ) {
    try {
      const ipAddress =
        req.headers['x-forwarded-for']?.[0] ||
        req.socket.remoteAddress ||
        'Unknown';
      const result = await this.booksService.createbookreturned(
        booklogpayload,
        ipAddress,
      );

      return result;
    } catch (error) {
      if (error instanceof Error) {
        console.log(error);
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
    }
  }
 

  @Patch('instituteid')
  async updateinstitute(book_copy_uuid:string,institute_uuid:string ){
  await this.booksService.updateinstituteid(book_copy_uuid,institute_uuid)
  }
}
