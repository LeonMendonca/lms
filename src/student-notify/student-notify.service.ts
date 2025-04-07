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
  };
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
    const { message, title } = generateNotificationContent(type, data);
    console.log({message, title, studentUuid})
    const notification = await this.notificationRepo.query(
      `INSERT INTO student_notifications (
        student_uuid,
        type,
        title,
        message,
        is_read,
        created_at
      ) VALUES (
        $1, $2, $3, $4, false, NOW()
      ) RETURNING *`,
      [studentUuid, type, title, message],
    );

    console.log("here")


    return {
      data: notification[0],
      pagination: null,
    };
  }

  async markAsRead(id: string): Promise<Data<StudentNotification>> {
    const result = await this.notificationRepo.query(
      `
      UPDATE student_notifications
      SET is_read = true,
          updated_at = NOW()
      WHERE notification_uuid = $1
      RETURNING *;
    `,
      [id],
    );
    return { data: result[0], pagination: null };
  }

  async getStudentNotifications(
    studentUuid: string,
    page: number = 1,
    limit: number = 10,
    type?: NotificationType,
  ) {
    const offset = (page - 1) * limit;
    let query = `
      SELECT * FROM student_notifications
      WHERE student_uuid = $1
      AND is_read = false
      AND created_at >= NOW() - INTERVAL '30 days'
    `;

    const params: (string | number)[] = [studentUuid];

    if (type) {
      query += ` AND type = $2`;
      params.push(type);
    }

    query += `
      ORDER BY created_at DESC
      LIMIT $${params.length + 1} 
      OFFSET $${params.length + 2}
    `;

    // params.push(limit, offset);

    const result: StudentNotification[] = await this.notificationRepo.query(
      query,
      [...params, limit, offset],
    );

    const total = await this.notificationRepo.query(
      `SELECT COUNT(*) as total FROM student_notifications 
      WHERE student_uuid = $1 AND is_read = false 
      AND created_at >= NOW() - INTERVAL '30 days'${type ? ' AND type = $2' : ''}`,
      params,
    );

    return {
      data: result,
      pagination: {
        total: parseInt(total[0].count),
        page,
        limit,
        pages: Math.ceil(parseInt(total[0].count) / limit),
      },
    };
  }
}
