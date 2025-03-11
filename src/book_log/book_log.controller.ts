import { BookLogService } from './book_log.service';
import { Controller, Get, Post } from '@nestjs/common';

@Controller('book-log')
export class BookLogController {

    constructor(private bookLogService: BookLogService) { }

    @Get("all")
    async getAllBookLogs() {
        return this.bookLogService.getBookLogs()
    }

    @Post("returned-books")
    async returnedBooks() {
        return this.bookLogService.returnedBooks()
    }
}
