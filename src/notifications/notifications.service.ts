import { Injectable, Logger, Param } from '@nestjs/common';
import { Cron, CronExpression, Interval, Timeout } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { isURL } from 'class-validator';
import { JournalsTable } from 'src/journals/entity/journals_table.entity';
import { Repository } from 'typeorm';

@Injectable()
export class NotificationsService {

    constructor(
        @InjectRepository(JournalsTable) private journalsTableRepo: Repository<JournalsTable>,
    ) { }

    private readonly logger = new Logger(NotificationsService.name)

    @Cron('* 30 * * * *')
    getDocsTenSeconds() {
        console.log('Past 10 Seconds')
    }

    // give updates about the number of tuples in the journals_table



    // return in an hour



}
