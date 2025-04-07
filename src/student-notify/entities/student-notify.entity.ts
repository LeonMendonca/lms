import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum NotificationType {
  // Book related
  BOOK_REQUESTED = 'book_requested',
  BOOK_REQUEST_APPROVED = 'book_request_approved',
  BOOK_REQUEST_REJECTED = 'book_request_rejected',
  BOOK_BORROWED = 'book_borrowed',
  BOOK_RETURNED = 'book_returned',
  BOOK_REISSUE_REQUESTED = 'book_reissue_requested',
  BOOK_REISSUE_APPROVED = 'book_reissue_approved',
  BOOK_REISSUE_REJECTED = 'book_reissue_rejected',

  // Library entry/exit
  LIBRARY_ENTRY = 'library_entry',
  LIBRARY_EXIT = 'library_exit',

  // Notes related
  NOTES_REQUESTED = 'notes_requested',
  NOTES_APPROVED = 'notes_approved',
  NOTES_REJECTED = 'notes_rejected',

  // Fees/Penalties
  PENALTY_ADDED = 'penalty_added',
  PENALTY_PAID = 'penalty_paid',
  PENALTY_OVERDUE = 'penalty_overdue',

  // Activity reporting
  ACTIVITY_REPORTED = 'activity_reported',
  ACTIVITY_RESOLVED = 'activity_resolved',
}

@Entity('student_notifications')
export class StudentNotification {
  @PrimaryGeneratedColumn('uuid', { name: 'notification_uuid' })
  notification_uuid: 'notification_uuid' = 'notification_uuid';

  @Column('uuid', { name: 'student_uuid' })
  student_uuid: 'student_uuid' = 'student_uuid';

  @Column({
    name: "type",
    type: 'enum',
    enum: NotificationType,
  })
  type: "type" = 'type';

  @Column({ name: 'title', type: 'text' })
  title: 'title' = 'title';

  @Column({ name: 'message', type: 'text' })
  message: 'message' = 'message';

  @Column({ name: 'is_read', type: 'boolean', default: false })
  is_read: 'is_read' = 'is_read';

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: 'created_at' = 'created_at';
}

export const studentnotification = new StudentNotification();

//Type that represents the table Columns
export type TStudentNotification = {
  [P in keyof typeof studentnotification as typeof studentnotification[P]]: any;
}
