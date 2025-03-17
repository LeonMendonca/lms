import { Injectable, Logger, Param } from '@nestjs/common';
import { Cron, CronExpression, Interval, SchedulerRegistry, Timeout } from '@nestjs/schedule';
import { CronJob } from "cron"
import { InjectRepository } from '@nestjs/typeorm';
import { JournalsCopy } from 'src/journals/entity/journals_copy.entity';
import { JournalsTable } from 'src/journals/entity/journals_table.entity';
import { Repository } from 'typeorm';

import { differenceInDays, format, parse } from 'date-fns';
import { Resend } from 'resend';


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

    private readonly logger = new Logger(NotificationsService.name)

    @Cron('0 0 13 * * *')
    async lunchUpdate() {
        console.log("Lunch Time It Is!!!")
    }

    // NOTIFY STUDENT TO RETURN BOOK 3 DAYS DUE - dynamic scheduled function

    // NOTIFY STUDENT ON THE DAY OF DUE - dynamic scheduled function
    @Cron('0 10 17 * * *') // calls function at 9AM on the day of returning the book
    async notifyOnDueDate() {
        try {

            const book = "Borrowed Book Name"
            const due_date = "15-03-2025"
            const from = "jigishamanohar18@gmail.com"
            const to = "jigishacodes4her@gmail.com"
            const subject = "Book due Today"
            const html = `<p>You have borrowed ${book}. It's due date is today. Kindly return the book by ${due_date} 5 PM </p>`

            // const response = await this.resend.emails.send({
            //     from: from,
            //     to: to,
            //     subject: subject,
            //     html: html
            // });

            return {
                book: book,
                due_date: due_date,
                from: from,
                to: to,
                subject: subject,
                html: html
            }
        } catch (error) {
            throw new Error("Error While Sending Email: ", error)
        }
    }

    // NOTIFY STUDENT WHEN THERE ARE 3 DAYS TO THE DUE_DATE
    @Cron('0 0 10 * * *') // calls function at 10AM before three days of returning the book
    async notifyBefore3Days() {
        const notif = `Return Book In 3 Days.`
        return {
            notification: notif
        }
    }

    // NOTIFY STUDENT EVERY WEEK AFTER THE DAY OF DUE - recurring function
    @Cron('0 0 10 * * *') // calls function everyday at 10AM if the date exceeds
    async notifyIfNotReturned() {
        let date = "15-03-2025"
        return {
            notification: `Due date passed on ${date}. Return the book`
        }
    }











}
