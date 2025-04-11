import { Injectable } from '@nestjs/common';
import {
  NotificationType,
  StudentNotification,
} from './entities/student-notify.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { generateNotificationContent } from './helpers/student-notify';
import { Booklog_v2 } from 'src/books_v2/entity/book_logv2.entity';
import { Cron } from '@nestjs/schedule';

export interface DataWithPagination<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null;
}

export interface Data<T> {
  data: T;
  pagination: null;
}

@Injectable()
export class StudentNotifyService {
  constructor(
    @InjectRepository(Booklog_v2)
    private booklogRepository: Repository<Booklog_v2>,

    @InjectRepository(StudentNotification)
    private notificationRepo: Repository<StudentNotification>,
  ) {}

  @Cron('0 0 * * *')
  async handleBookReturnReminder() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const logs = await this.booklogRepository.find({
      where: { isReturned: false, expectedDate: today },
    });

    for (const log of logs) {
      const notification = this.notificationRepo.create({
        studentUuid: log.borrowerUuid,
        type: NotificationType.PENALTY_REMINDER, // Or BOOK_BORROWED if it's not a penalty
        title: 'Reminder to return your book today',
        message: `Your book ${log?.newBookTitle?.bookTitle} is due to be returned today. Any more delays would result in a fine`,
      });

      await this.notificationRepo.save(notification);
    }

    const threeDaysLeft = new Date(today);
    threeDaysLeft.setDate(today.getDate() - 3);
    const logs3DaysBack = await this.booklogRepository.find({
      where: { isReturned: false, expectedDate: threeDaysLeft },
    });
    for (const log of logs3DaysBack) {
      const notification = this.notificationRepo.create({
        studentUuid: log.borrowerUuid,
        type: NotificationType.PENALTY_REMINDER, // Or BOOK_BORROWED if it's not a penalty
        title: 'Hope you are enjoying your book',
        message: `Hope you are enjoying your book ${log?.newBookTitle?.bookTitle}. Remember to return it on time to avoid additional fines`,
      });

      await this.notificationRepo.save(notification);
    }

    const allOverdueLogs = await this.booklogRepository.find({
      where: {
        isReturned: false,
        expectedDate: LessThan(new Date()), // Only books overdue (i.e., expectedDate < today)
      },
    });

    for (const log of allOverdueLogs) {
      if (!log.expectedDate) continue;
  
      const expected = new Date(log.expectedDate);
      expected.setHours(0, 0, 0, 0);
  
      const msDiff = today.getTime() - expected.getTime();
      const dayDiff = Math.floor(msDiff / (1000 * 60 * 60 * 24));
  
      if (dayDiff > 0 && dayDiff % 3 === 0) {
        const notification = this.notificationRepo.create({
          studentUuid: log.borrowerUuid,
          type: NotificationType.PENALTY_OVERDUE,
          title: 'Overdue Book Reminder',
          message: `Your book "${log?.newBookTitle?.bookTitle}" is overdue by ${dayDiff} days. Please return it soon to avoid further fines.`,
        });
        await this.notificationRepo.save(notification);
      }
    }
  }

  async createNotification(
    studentUuid: string,
    type: NotificationType,
    data: Record<string, any>,
  ): Promise<Data<StudentNotification>> {
    try {
      const { message, title } = generateNotificationContent(type, data);

      const notification = this.notificationRepo.create({
        studentUuid,
        type,
        title,
        message,
        createdAt: new Date(),
      });

      const savedNotification = await this.notificationRepo.save(notification);

      return {
        data: savedNotification,
        pagination: null,
      };
    } catch (error) {
      throw error;
    }
  }

  async markAsRead(
    notificationUuid: string,
  ): Promise<Data<StudentNotification>> {
    try {
      const result = await this.notificationRepo
        .createQueryBuilder()
        .update(StudentNotification)
        .set({ isRead: true })
        .where('notificationUuid = :notificationUuid', { notificationUuid })
        .returning('*')
        .execute();

      return {
        data: result.raw[0],
        pagination: null,
      };
    } catch (error) {
      throw error;
    }
  }

  async getStudentNotifications(
    studentUuid: string,
    type?: NotificationType,
  ): Promise<DataWithPagination<StudentNotification>> {
    try {
      const query = this.notificationRepo
        .createQueryBuilder('notification')
        .where('notification.studentUuid = :studentUuid', { studentUuid })
        .andWhere('notification.isRead = false')
        .andWhere("notification.createdAt >= NOW() - INTERVAL '30 days'");

      if (type) {
        query.andWhere('notification.type = :type', { type });
      }
      const result = await query
        .orderBy('notification.createdAt', 'DESC')
        .getMany();
      return {
        data: result,
        pagination: null,
      };
    } catch (error) {
      throw error;
    }
  }
}
