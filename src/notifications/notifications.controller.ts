import { Body, ConsoleLogger, Controller, Get, HttpException, HttpStatus, Post } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { parse, differenceInDays, startOfDay, setDefaultOptions, parseISO, format } from 'date-fns';
import { toZonedTime } from "date-fns-tz";

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
        // books
        @InjectRepository(Booklog_v2) private bookLogRepo: Repository<Booklog_v2>,

        // journals
        @InjectRepository(JournalCopy) private journalCopyRepo: Repository<JournalCopy>,
        @InjectRepository(JournalLogs) private journalLogRepo: Repository<JournalLogs>,
        @InjectRepository(JournalTitle) private journalTitleRepo: Repository<JournalTitle>,


        @InjectRepository(Students) private studentsRepo: Repository<Students>

        // @InjectRepository(JournalsTable) private journalRepo: Repository<JournalsTable>,
    ) { }

    // @Post('books')
    // async notifyStudent(@Body('journal_uuid') journal_uuid: UUID) {
    // async notifyStudentAboutBooks() {
    //     // select the journal log from the table
    //     const book_log = await this.journalLogRepo.query(
    //         `SELECT * FROM journal_logs WHERE journal_log_uuid='${journal_log_uuid}' AND action='borrowed'`
    //     )

    //     // check if the particular log is valid and available
    //     if (!book_log.length) {
    //         throw new HttpException('Book Log Not Found', HttpStatus.NOT_FOUND);
    //     }

    //     // extract the required information from the database
    //     const borrowed_date = await this.journalTitleRepo.query(
    //         `SELECT subscription_start_date FROM journal_titles WHERE journal_uuid='${book_log[0].journal_title_uuid}'`
    //     )
    //     const return_date = await this.journalTitleRepo.query(
    //         `SELECT subscription_end_date FROM journal_titles WHERE journal_uuid = '${book_log[0].journal_title_uuid}'`
    //     )

    //     // format the extracted dates according to our needs
    //     const formattedBorrowedDate = format(borrowed_date[0].subscription_start_date, "yyyy-MM-dd");
    //     const formattedReturnDate = format(return_date[0].subscription_end_date, "yyyy-MM-dd");
    //     const today = format(new Date(), "yyyy-MM-dd")

    //     // extract other information that we wanna pass in the functions
    //     let journalName = await this.journalTitleRepo.query(
    //         `SELECT journal_title FROM journal_titles WHERE journal_uuid='${book_log[0].journal_title_uuid}'`
    //     )
    //     journalName = journalName[0].journal_title
    //     const studentName = await this.studentsRepo.query(
    //         `SELECT student_name FROM students_table WHERE student_uuid='${book_log[0].borrower_uuid}'`
    //     )
    //     const publisherName = await this.journalTitleRepo.query(
    //         `SELECT name_of_publisher FROM journal_titles WHERE journal_uuid='${book_log[0].journal_title_uuid}'`
    //     )

    //     // calculate the differences to call functions
    //     const diffInDays = differenceInDays(startOfDay(formattedReturnDate), startOfDay(today))

    //     // this will be coded when the fees and penalty table is integrated with the periodicals
    //     const fine = 5
    //     const totalFine = Math.abs(diffInDays) * fine

    //     // conditionally call functions
    //     if (diffInDays === 0) {
    //         return this.notificationsService.notifyForBookOnDueDate(formattedBorrowedDate, journalName, studentName, publisherName)
    //     } else if (diffInDays === 3) {
    //         return this.notificationsService.notifyForBookBefore3Days(formattedBorrowedDate, journalName, studentName, publisherName)
    //     } else if (diffInDays < 0) {
    //         return this.notificationsService.notifyForBookIfNotReturned(formattedReturnDate, journalName, studentName, publisherName, totalFine, fine)
    //     } else {
    //         return "Take Care If There Are Edge Cases"
    //     }
    // }

    @Post('journals')
    async journalNotifications(
        @Body('journal_log_uuid') journal_log_uuid: UUID
    ) {
        // select the journal log from the table
        const journal_log = await this.journalLogRepo.query(
            `SELECT * FROM journal_logs WHERE journal_log_uuid='${journal_log_uuid}' AND action='borrowed'`
        )

        // check if the particular log is valid and available
        if (!journal_log.length) {
            throw new HttpException('Journal Log Not Found', HttpStatus.NOT_FOUND);
        }

        // extract the required information from the database
        const borrowed_date = await this.journalTitleRepo.query(
            `SELECT subscription_start_date FROM journal_titles WHERE journal_uuid='${journal_log[0].journal_title_uuid}'`
        )
        const return_date = await this.journalTitleRepo.query(
            `SELECT subscription_end_date FROM journal_titles WHERE journal_uuid = '${journal_log[0].journal_title_uuid}'`
        )

        // format the extracted dates according to our needs
        const formattedBorrowedDate = format(borrowed_date[0].subscription_start_date, "yyyy-MM-dd");
        const formattedReturnDate = format(return_date[0].subscription_end_date, "yyyy-MM-dd");
        const today = format(new Date(), "yyyy-MM-dd")

        // extract other information that we wanna pass in the functions
        let journalName = await this.journalTitleRepo.query(
            `SELECT journal_title FROM journal_titles WHERE journal_uuid='${journal_log[0].journal_title_uuid}'`
        )
        journalName = journalName[0].journal_title
        const studentName = await this.studentsRepo.query(
            `SELECT student_name FROM students_table WHERE student_uuid='${journal_log[0].borrower_uuid}'`
        )
        const publisherName = await this.journalTitleRepo.query(
            `SELECT name_of_publisher FROM journal_titles WHERE journal_uuid='${journal_log[0].journal_title_uuid}'`
        )

        // calculate the differences to call functions
        const diffInDays = differenceInDays(startOfDay(formattedReturnDate), startOfDay(today))

        // this will be coded when the fees and penalty table is integrated with the periodicals
        const fine = 5
        const totalFine = Math.abs(diffInDays) * fine

        // call functions
        if (diffInDays === 0) {
            return this.notificationsService.notifyForJouralOnDueDate(formattedBorrowedDate, journalName, studentName, publisherName)
        } else if (diffInDays === 3) {
            return this.notificationsService.notifyForJournalBefore3Days(formattedReturnDate, journalName, studentName, publisherName)
        } else if (diffInDays < 0) {
            return this.notificationsService.notifyForJournalIfNotReturned(formattedReturnDate, journalName, studentName, publisherName, totalFine, fine)
        } else {
            return "Take Care If There Are Edge Cases"
        }

    }
}
