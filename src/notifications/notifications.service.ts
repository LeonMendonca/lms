import { Injectable } from '@nestjs/common';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { JournalsCopy } from 'src/journals/entity/journals_copy.entity';
import { JournalsTable } from 'src/journals/entity/journals_table.entity';
import { CircularRelationsError, Repository } from 'typeorm';

import { Resend } from 'resend';

import { bookDueToday } from './html_files/book-duetoday-html';
import { bookDue3Days } from './html_files/book-due3days-html';
import { bookOverDue } from './html_files/book-overdue-html';
import { journalDueToday } from './html_files/journal-duetoday-html';
import { journalDue3Days } from './html_files/journal-due3days-html';
import { journalOverDue } from './html_files/journal-overdue-html';

@Injectable()
export class NotificationsService {
    private resend: Resend

    constructor(
        @InjectRepository(JournalsTable) private journalsTableRepo: Repository<JournalsTable>,

        @InjectRepository(JournalsCopy) private journalsCopyRepo: Repository<JournalsCopy>,

        private schedulerRegistry: SchedulerRegistry,
    ) {
        this.resend = new Resend(process.env.RESEND_API_KEY)
    }


    // ---------------------- BOOKS NOTIFICATION --------------------------

    @Cron('0 0 9 * * *')
    async notifyForBookOnDueDate(returnDate: string, bookName: string) {
        try {
            let template = bookDueToday
            // things to change
            const student_name = "Jigisha Ghanekar"
            const library_name = "Library 1"

            template = template.replaceAll("[User's Name]", student_name).replaceAll("[Journal Title]", bookName).replaceAll("[Return Date]", returnDate).replaceAll("[Library Name]", library_name)

            return template
        } catch (error) {
            return {
                error: error
            }
        }
    }

    @Cron('0 0 10 * * *')
    async notifyForBookBefore3Days(returnDate: string, bookName: string) {
        try {
            let template = bookDue3Days
            // things to change
            const student_name = "Jigisha Ghanekar"
            const library_name = "Library 1"

            template = template.replaceAll("[User's Name]", student_name).replaceAll("[Journal Title]", bookName).replaceAll("[Return Date]", returnDate).replaceAll("[Library Name]", library_name)

            return template
        } catch (error) {
            throw new Error("Error While Sending Email: ", error)

        }
    }

    @Cron('0 0 10 * * 1')
    async notifyForBookIfNotReturned(returnDate: string, bookName: string, total_fine: number, fine: number) {
        try {
            let template = bookOverDue
            // things to change
            const student_name = "Jigisha Ghanekar"
            const library_name = "Library 1"

            template = template.replaceAll("[User's Name]", student_name).replaceAll("[Journal Title]", bookName).replaceAll("[Return Date]", returnDate).replaceAll("[Library Name]", library_name).replaceAll("[Total Fine]", String(total_fine)).replaceAll("[Fine Amount]", String(fine))

            return template
        } catch (error) {
            throw new Error("Error While Sending Email", error)
        }
    }



    // ---------------------- JOURNALS NOTIFICATION --------------------------------

    @Cron('0 0 9 * * *')
    async notifyForJouralOnDueDate(returnDate: string, journalName: string) {
        try {
            let template = journalDueToday
            // things to change
            const student_name = "Jigisha Ghanekar"
            const library_name = "Library 1"

            template = template.replaceAll("[User's Name]", student_name).replaceAll("[Book Title]", journalName).replaceAll("[Return Date]", returnDate).replaceAll("[Library Name]", library_name)

            return template
        } catch (error) {
            return {
                error: error
            }
        }
    }

    @Cron('0 0 10 * * *')
    async notifyForJournalBefore3Days(returnDate: string, journalName: string) {
        try {
            let template = journalDue3Days
            // things to change
            const student_name = "Jigisha Ghanekar"
            const library_name = "Library 1"

            template = template.replaceAll("[User's Name]", student_name).replaceAll("[Book Title]", journalName).replaceAll("[Return Date]", returnDate).replaceAll("[Library Name]", library_name)

            return template
        } catch (error) {
            throw new Error("Error While Sending Email: ", error)

        }
    }

    @Cron('0 0 10 * * 1')
    async notifyForJournalIfNotReturned(returnDate: string, journalName: string, total_fine: number, fine: number) {
        try {
            let template = journalOverDue
            // things to change
            const student_name = "Jigisha Ghanekar"
            const library_name = "Library 1"

            template = template.replaceAll("[User's Name]", student_name).replaceAll("[Journal Title]", journalName).replaceAll("[Return Date]", returnDate).replaceAll("[Library Name]", library_name).replaceAll("[Total Fine]", String(total_fine)).replaceAll("[Fine Amount]", String(fine))

            return template
        } catch (error) {
            throw new Error("Error While Sending Email", error)
        }
    }



}
