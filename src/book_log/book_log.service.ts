import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booklog } from './book_log.entity';

@Injectable()
export class BookLogService {
    constructor(@InjectRepository(Booklog) private bookLogRepository: Repository<Booklog>) { }


    async getBookLogs() {
        return "Book Logs";
    }

    async returnedBooks() {
        return "Returned Books"
    }
}
