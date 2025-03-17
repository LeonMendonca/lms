import { Injectable, Logger, Param } from '@nestjs/common';
import { Cron, CronExpression, Interval, SchedulerRegistry, Timeout } from '@nestjs/schedule';
import { CronJob } from "cron"
import { InjectRepository } from '@nestjs/typeorm';
import { JournalsCopy } from 'src/journals/entity/journals_copy.entity';
import { JournalsTable } from 'src/journals/entity/journals_table.entity';
import { Repository } from 'typeorm';

import { differenceInDays, format, parse } from 'date-fns';
import { Resend } from 'resend';

// const resend = new Resend(process.env.RESEND_API_KEY)

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

    @Cron('0 0 13 * * *')
    async lunchUpdate() {
        console.log("Lunch Time It Is!!!")
    }

    // NOTIFY STUDENT ON THE DAY OF DUE - dynamic scheduled function
    @Cron('0 0 9 * * *') // calls function at 9AM on the day of returning the book
    async notifyOnDueDate(returnDate: string, bookName: string) {
        try {
            // const response = await this.resend.emails.send({
            //     from: from,
            //     to: to,
            //     subject: subject,
            //     html: html
            // });

            return {
                book: bookName,
                due_date: returnDate,
                from: "jigishamanohar18@gmail.com",
                to: "jigishacodes4her@gmail.com",
                subject: "Book due Today",
                html: `<p>You have borrowed the book - <b>${bookName}</b>. It's due date is today. <br><b>Kindly return the book by ${returnDate} 5 PM </b></p>`
            }
        } catch (error) {
            throw new Error("Error While Sending Email: ", error)
        }
    }

    // NOTIFY STUDENT WHEN THERE ARE 3 DAYS TO THE DUE_DATE
    @Cron('0 0 10 * * *') // calls function at 10AM before three days of returning the book
    async notifyBefore3Days(returnDate: string, bookName: string) {
        return {
            book: bookName,
            due_date: returnDate,
            from: "jigishamanohar18@gmail.com",
            to: "jigishacodes4her@gmail.com",
            subject: "Book due Today",
            html: `<p>You have borrowed the book - <b>${bookName}</b>. It's due date is on ${returnDate}. <br><b>Kindly return the book by ${returnDate} 5 PM </b></p>`
        }
    }

    // NOTIFY STUDENT EVERY WEEK AFTER THE DAY OF DUE - recurring function
    @Cron('0 0 10 * * *') // calls function everyday at 10AM if the date exceeds
    async notifyIfNotReturned(returnDate: string, bookName: string, penalty: number) {

        return {
            book: bookName,
            due_date: returnDate,
            from: "jigishamanohar18@gmail.com",
            to: "jigishacodes4her@gmail.com",
            subject: "Book due Today",
            html: `<p>You have borrowed the book - <b>${bookName}</b>. It's due date was on ${returnDate}.<br>The Penalty fee is ${penalty}.<br>Please return the book as soon as possible.</p>`
        }
    }











}
