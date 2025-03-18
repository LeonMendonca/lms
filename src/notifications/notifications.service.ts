import { Injectable } from '@nestjs/common';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { JournalsCopy } from 'src/journals/entity/journals_copy.entity';
import { JournalsTable } from 'src/journals/entity/journals_table.entity';
import { Repository } from 'typeorm';

import { Resend } from 'resend';
import { dueToday } from './html_files/duetoday-html';
import { due3Days } from './html_files/due3days-html';
import { overDue } from './html_files/overdue-html';


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
        const from = "jigishaghanekar18@gmail.com"
        try {
            // take the student email from the student table
            // load the template file
            // replaceAll the changes
            // in const variable store the response that is sent
            //  return the const variable




        } catch (error) {
            return {
                error: error
            }
        }





    }

    // NOTIFY STUDENT WHEN THERE ARE 3 DAYS TO THE DUE_DATE
    @Cron('0 0 10 * * *') // calls function at 10AM before three days of returning the book
    async notifyBefore3Days(returnDate: string, bookName: string) {
        try {
            let template = due3Days

            // things to change
            const student_name = "Jigisha Ghanekar"
            const library_name = "Library 1"

            template = template.replaceAll("[User's Name]", student_name).replaceAll("[Book Title]", bookName).replaceAll("[Return Date]", returnDate).replaceAll("[Library Name]", library_name)

            return template
        } catch (error) {
            throw new Error("Error While Sending Email: ", error)

        }
    }

    // NOTIFY STUDENT EVERY WEEK AFTER THE DAY OF DUE - recurring function
    @Cron('0 0 10 * * 1') // calls function everyday at 10AM every Monday if the date exceeds
    async notifyIfNotReturned(returnDate: string, bookName: string, total_fine: number, fine: number) {
        try {
            let template = overDue

            // things to change
            const student_name = "Jigisha Ghanekar"
            const library_name = "Library 1"

            template = template.replaceAll("[User's Name]", student_name).replaceAll("[Book Title]", bookName).replaceAll("[Return Date]", returnDate).replaceAll("[Library Name]", library_name).replaceAll("[Total Fine]", String(total_fine)).replaceAll("[Fine Amount]", String(fine))

            return template
        } catch (error) {
            throw new Error("Error While Sending Email", error)
        }
    }

}
