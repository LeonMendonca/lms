import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

export const Action = {
  ENTRY: 'entry',
  EXIT: 'exit',
} as const;

@Entity('inquire_logs')
export class InquireLogs {
  @PrimaryGeneratedColumn('uuid', { name: 'report_uuid' })
  reportUUID: 'report_uuid' = 'report_uuid';

  @Column({ name: 'student_uuid', type: 'uuid' })
  studentUuid: 'student_uuid' = 'student_uuid';

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: 'created_at' = 'created_at';

  @Column({ name: 'inquiry_type' })
  inquiryType: 'inquiry_type' = 'inquiry_type';

  @Column({ name: 'inquiry_uuid' })
  inquiryUuid: 'inquiry_uuid' = 'inquiry_uuid';

  @Column({
    name: 'is_resolved',
    type: 'boolean',
    default: false,
  })
  isResolved: 'is_resolved' = 'is_resolved';

  @Column({
    name: 'is_archived',
    type: 'boolean',
    default: false,
  })
  isArchived: 'is_archived' = 'is_archived';
}

export const inquire = new InquireLogs();

//Type that represents the table Columns
export type TInquiry = {
  [P in keyof typeof inquire as (typeof inquire)[P]]: (typeof inquire)[P];
};
