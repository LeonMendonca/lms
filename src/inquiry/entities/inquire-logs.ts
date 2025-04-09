import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('inquire_logs')
export class InquireLogs {
  @PrimaryGeneratedColumn('uuid', { name: 'inquiryUuid' })
  inquiryUuid: string;

  @Column({ name: 'studentUuid', type: 'uuid' })
  studentUuid: string;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @Column({ name: 'inquiryType' })
  inquiryType: string;

  @Column({ name: 'inquiryReqUuid' })
  inquiryReqUuid: string;

  @Column({
    name: 'isResolved',
    type: 'boolean',
    default: false,
  })
  isResolved: boolean;

  @Column({
    name: 'isArchived',
    type: 'boolean',
    default: false,
  })
  isArchived: boolean;
}
