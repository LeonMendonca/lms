import { Controller, Get } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { parse, differenceInDays, startOfDay } from 'date-fns';

@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    async notifyStudent() {
        const dateFormat = "dd-MM-yyyy" // my format


        // yeh dono fields toh hatt jayenge whe we take the user input
        const issuedDate = "10-03-2025" // date of issue book - take form table
        const returnDate = "20-03-2025" // date of return book - take from table

        const today = startOfDay(new Date())
        // standardizing the date format into our specified dateFormat
        const newIssueDate = parse(issuedDate, dateFormat, new Date())
        const newReturnDate = parse(returnDate, dateFormat, new Date())

        const isBorrowed = true // take input from the database

        const diffInDates = differenceInDays(startOfDay(newReturnDate), today)

        const bookName = "Astrophysical Dynamics Review"
        const fine = 50
        const total_fine = 150
        // const penalty = Math.abs(50 * diffInDates)

        // conditionally call functions
        if (diffInDates === 0 && isBorrowed) {
            return this.notificationsService.notifyOnDueDate(returnDate, bookName)
        } else if (diffInDates === 3 && isBorrowed) {
            return this.notificationsService.notifyBefore3Days(returnDate, bookName)
        } else if (diffInDates < 0 && isBorrowed) {
            return this.notificationsService.notifyIfNotReturned(returnDate, bookName, total_fine, fine)
        } else {
            return "Take Care If There Are Edge Cases"
        }
    }

}
