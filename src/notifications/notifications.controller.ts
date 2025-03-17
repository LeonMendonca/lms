import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { parse, format, differenceInDays, startOfDay } from 'date-fns';

@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    async notifyStudent() {
        const dateFormat = "dd-MM-yyyy" // format in which i expect dates to come


        // yeh dono fields toh hatt jayenge whe we take the user input
        const issuedDate = "10-03-2025" // date of issue book
        const returnDate = "15-03-2025" // date of return book

        const today = startOfDay(new Date()) // take todays date in expected format
        // standardizing the date format into our specified dateFormat
        const newIssueDate = parse(issuedDate, dateFormat, new Date())
        const newReturnDate = parse(returnDate, dateFormat, new Date())

        const isBorrowed = true // take input from the database

        const diffInDates = differenceInDays(startOfDay(newReturnDate), today) // calculate difference between the dates
        console.log(diffInDates)

        // conditionally call functions
        if (diffInDates === 0 && isBorrowed) {
            return this.notificationsService.notifyOnDueDate()
        } else if (diffInDates === 3 && isBorrowed) {
            return this.notificationsService.notifyBefore3Days()
        } else if (diffInDates > 0 && isBorrowed) {
            return this.notificationsService.notifyIfNotReturned()
        } else {
            return "Take Care If There Are Edge Cases"
        }
    }

}
