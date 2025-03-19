import { Body, Controller, Get, Post } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { parse, differenceInDays, startOfDay } from 'date-fns';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ReturnDocument } from 'typeorm';
import { UUID } from 'crypto';
import { JournalsTable } from 'src/journals/entity/journals_table.entity';
import { Booklog_v2 } from 'src/books_v2/entity/book_logv2.entity';
import { DateTime } from 'luxon';

@Controller('notifications')
export class NotificationsController {
    constructor(
        private readonly notificationsService: NotificationsService,

        @InjectRepository(Booklog_v2) private bookLogRepo: Repository<Booklog_v2>,

        @InjectRepository(JournalsTable) private journalRepo: Repository<JournalsTable>,
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


    @Post('journals')
    async notifyStudentAboutJournals(@Body('journal_uuid') journal_uuid: UUID, @Body('student_uuid') student_uuid: string) {

        const journal = await this.journalRepo.query(
            `SELECT * FROM journals_table WHERE journal_uuid='${journal_uuid}' AND is_archived=false`
        )

        const startDate = this.convertToIST(startOfDay(journal[0].subscription_start_date));
        const returnDate = this.convertToIST(new Date(journal[0].subscription_end_date));
        const diffInDays = differenceInDays(startDate, returnDate)
        const isBorrowed = true

        const journalName = journal[0].name_of_journal

        const fine = 50
        const total_fine = fine * Math.abs(diffInDays)


        if (diffInDays === 0 && isBorrowed) {
            return this.notificationsService.notifyForJouralOnDueDate(returnDate, journalName)
        } else if (diffInDays === 3 && isBorrowed) {
            return this.notificationsService.notifyForJournalBefore3Days(returnDate, journalName)
        } else if (diffInDays < 0 && isBorrowed) {
            return this.notificationsService.notifyForJournalIfNotReturned(returnDate, journalName, total_fine, fine)
        } else {
            return "Take Care If There Are Edge Cases"
        }
    }
    private convertToIST(date: Date): string {
        return DateTime.fromJSDate(date).setZone("Asia/Kolkata").toFormat("yyyy-MM-dd");
    }
}
