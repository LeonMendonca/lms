import { Injectable } from '@nestjs/common';
import {
  NotificationType,
  StudentNotification,
} from './entities/student-notify.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { generateNotificationContent } from './helpers/student-notify';

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
    @InjectRepository(StudentNotification)
    private notificationRepo: Repository<StudentNotification>,
  ) {}

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
