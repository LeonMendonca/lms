import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';


@Entity('request_book_log')
export class RequestBook {
  @PrimaryGeneratedColumn('uuid',{ name: 'requestId' })
  requestId: string;

  @Column({ name: 'studentUuid', type: 'varchar' })
  studentUuid: string;

  @Column({ name: 'bookCopyId', type: 'varchar' })
  bookCopyId: string;

  @Column({ name: 'barcode', type: 'varchar' })
  barcode: string;

  @Column({
    name: 'status',
    type: 'varchar',
  })
  status: string;

  @Column({ name: 'requestType', type: 'varchar', nullable: true })
  requestType: string;

  @Column({ name: 'reason', type: 'varchar', nullable: true })
  reason: string;

  @Column({ name: 'ipAddress', type: 'varchar' })
  ipAddress: string;

  @Column({ name: 'isArchived', type: 'boolean', default: false })
  isArchived: boolean;

  @Column({ name: 'isCompleted', type: 'boolean', default: false })
  isCompleted: boolean;

  @CreateDateColumn({ name: 'createdAt'})
  createdAt: Date;

  @Column({ name: 'instituteUuid', type: 'uuid', nullable: true })
  instituteUuid: string;

  @Column({ name: 'instituteName', type: 'varchar', nullable: true })
  instituteName: string;
}