import { Body, Controller, Get, Post } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { parse, differenceInDays, startOfDay } from 'date-fns';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ReturnDocument } from 'typeorm';
import { UUID } from 'crypto';
import { Booklog_v2 } from 'src/books_v2/entity/book_logv2.entity';
import { DateTime } from 'luxon';
import { JournalCopy } from 'src/journals/entity/journals_copy.entity';
import { JournalLogs } from 'src/journals/entity/journals_log.entity';
import { JournalTitle } from 'src/journals/entity/journals_title.entity';
import { Students } from 'src/students/students.entity';
import { SoftDeleteQueryBuilder } from 'typeorm/query-builder/SoftDeleteQueryBuilder';

@Controller('notifications')
export class NotificationsController {
    constructor(
        private readonly notificationsService: NotificationsService,

        @InjectRepository(Booklog_v2) private bookLogRepo: Repository<Booklog_v2>,

        @InjectRepository(JournalCopy) private journalCopyRepo: Repository<JournalCopy>,
        @InjectRepository(JournalLogs) private journalLogRepo: Repository<JournalLogs>,
        @InjectRepository(JournalTitle) private journalTitleRepo: Repository<JournalTitle>,


        @InjectRepository(Students) private studentsRepo: Repository<Students>

        // @InjectRepository(JournalsTable) private journalRepo: Repository<JournalsTable>,
    ) { }

    @Post('books')
    // async notifyStudent(@Body('journal_uuid') journal_uuid: UUID) {
    async notifyStudentAboutBooks() {
        const dateFormat = "dd-MM-yyyy" // my format

        // yeh dono fields toh hatt jayenge whe we take the user input
        const issuedDate = "10-03-2025" // take form table
        const returnDate = "15-03-2025" // take from table

        const today = startOfDay(new Date())
        const newIssueDate = parse(issuedDate, dateFormat, new Date())
        const newReturnDate = parse(returnDate, dateFormat, new Date())

        const isBorrowed = true // take input from the database

        const diffInDates = differenceInDays(startOfDay(newReturnDate), today)

        const bookName = "Astrophysical Dynamics Review"
        const fine = 50
        const total_fine = fine * Math.abs(diffInDates)
        // const penalty = Math.abs(50 * diffInDates)

        // conditionally call functions
        if (diffInDates === 0 && isBorrowed) {
            return this.notificationsService.notifyForBookOnDueDate(returnDate, bookName)
        } else if (diffInDates === 3 && isBorrowed) {
            return this.notificationsService.notifyForBookBefore3Days(returnDate, bookName)
        } else if (diffInDates < 0 && isBorrowed) {
            return this.notificationsService.notifyForBookIfNotReturned(returnDate, bookName, total_fine, fine)
        } else {
            return "Take Care If There Are Edge Cases"
        }
    }


    @Post('journals') // IDHAR JOURNAL_LOGS KAAM AYEGA
    async notifyStudentAboutJournals(@Body('journal_uuid') journal_uuid: UUID, @Body('student_uuid') student_uuid: string) {
        const dateFormat = "dd-MM-yyyy"

        const student = await this.studentsRepo.query(
            ` SELECT * FROM students_table WHERE student_uuid='${student_uuid}'`
        )

        const journal = await this.journalTitleRepo.query(
            `SELECT * FROM journal_titles WHERE journal_uuid='${journal_uuid}'`
        )

        const start_date = this.convertToIST(journal[0].created_at)
        const end_date = this.convertToIST(journal[0].updated_at)


        const diffInDays = differenceInDays(start_date, end_date)
        const isBorrowed =

            console.log(start_date, end_date, diffInDays)




    }
    private convertToIST(date: Date): string {
        return DateTime.fromJSDate(date).setZone("Asia/Kolkata").toFormat("yyyy-MM-dd");
    }
}
