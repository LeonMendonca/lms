import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
} from 'typeorm';

const EnumStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

const EnumRequestType = {
  ISSUE: 'issue',
  RETURN: 'return',
  REISSUE: 're-issue',
} as const;

@Entity('request_book_log')
export class RequestBook {
  //Format unknown
  @PrimaryColumn({ name: 'request_id' })
  requestId: 'request_id' = 'request_id';

  @Column({ name: 'student_id', type: 'varchar' })
  studentId: 'student_id' = 'student_id';

  @Column({ name: 'book_copy_id', type: 'varchar' })
  bookCopyId: 'book_copy_id' = 'book_copy_id';

  @Column({ name: 'barcode', type: 'varchar' })
  bookBarcode: 'barcode' = 'barcode';

  @Column({
    name: 'status',
    type: 'enum',
    enum: EnumStatus,
    default: 'pending',
  })
  status: 'status' = 'status';

  @Column({ name: 'request_type', type: 'enum', enum: EnumRequestType })
  requestType: 'request_type' = 'request_type';

  @Column({ name: 'reject_reason', type: 'varchar', nullable: true })
  rejectReason: 'reject_reason' = 'reject_reason';

  @Column({ name: 'ip_address', type: 'varchar' })
  ipAddress: 'ip_address' = 'ip_address';

  @Column({ name: 'is_archived', type: 'bool', default: false })
  isArchived: 'is_archived' = 'is_archived';

  @Column({ name: 'is_completed', type: 'bool', default: false })
  isCompleted: 'is_completed' = 'is_completed';

  @Column({
    name: 'request_created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  requestCreatedAt: 'request_created_at' = 'request_created_at';

  @Column({ name: 'extended_period', type: 'int', nullable: true })
  extendePeriod: 'extended_period' = 'extended_period';

  @Column({ name: 'institute_uuid', type: 'uuid', nullable: true })
  instituteUuid: 'institute_uuid' = 'institute_uuid';

  @Column({ name: 'institute_name', type: 'varchar', nullable: true })
  instituteName: 'institute_name' = 'institute_name';
}

export const request_book = new RequestBook();

export type TRequestBook = {
  [P in keyof typeof request_book as (typeof request_book)[P]]: any;
};
