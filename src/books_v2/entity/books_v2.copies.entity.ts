import {
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BookTitle } from './books_v2.title.entity';

@Entity('book_copies')
export class BookCopy {
  @PrimaryGeneratedColumn('uuid', { name: 'bookCopyUuid' })
  bookCopyUuid: string;
  // Copy

  @Column({ name: 'price', type: 'varchar', nullable: true })
  price: string;

  @Column({ name: 'supplierPrice', type: 'varchar', nullable: true })
  supplierPrice: string;

  @Column({ name: 'dateReceipt', type: 'timestamp', nullable: true })
  dateReceipt: Date;

  @Column({ name: 'sourceOfAcquisition', type: 'varchar', nullable: true })
  sourceOfAcquisition: string;

  @Column({ name: 'billNo', type: 'varchar', nullable: true })
  billNo: string;

  @Column({ name: 'billDate', type: 'timestamp', nullable: true })
  billDate: Date;

  @Column({ name: 'keyNo', type: 'varchar', nullable: true })
  keyNo: string;

  @Column({ name: 'rowNo', type: 'varchar', nullable: true })
  rowNo: string;

  @Column({ name: 'instituteName', type: 'varchar' })
  instituteName: string;

  @Column({ name: 'instituteUuid', type: 'uuid' })
  instituteUuid: string;

  @Column({ name: 'copyRemarks', type: 'simple-array', nullable: true })
  copyRemarks: string[];

  @Column({ name: 'isAvailable', type: 'boolean', default: true })
  isAvailable: boolean;

  @Column({ name: 'isArchived', type: 'boolean', default: false })
  isArchived: boolean;

  @Column({ name: 'loaned', type: 'boolean', default: false })
  loaned: boolean;

  @Column({ name: 'loanReturnDate', type: 'timestamp', nullable: true })
  loanReturnDate: Date;

  @Column({ name: 'donated', type: 'boolean', default: false })
  donated: boolean;

  @Column({ name: 'bookNumber', type: 'varchar', nullable: true })
  bookNumber: string;

  @Column({ name: 'bookSize', type: 'varchar', nullable: true })
  bookSize: string;

  @Column({ name: 'isBound', type: 'boolean', default: false })
  isBound: boolean;

  @Column({ name: 'lockStatus', type: 'boolean', default: false })
  lockStatus: boolean;

  @Column({
    name: 'barcode',
    type: 'varchar',
    length: 255,
    unique: true,
    nullable: true,
  })
  barcode: string;

  @Column({
    name: 'bindInfo',
    type: 'varchar',
    nullable: true,
  })
  bindInfo: string;

  @Column({ name: 'grantName', type: 'varchar', nullable: true })
  grantName: string;

  @Column({ name: 'bookCondition', type: 'varchar', nullable: true })
  bookCondition: string;

  @CreateDateColumn({ name: 'createdAt'})
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
  
  @Column({ name: 'copyImage', type: 'varchar', nullable: true })
  copyImage: string;

  @ManyToOne(() => BookTitle, (bookTitle) => bookTitle.bookCopiesUuidRel)
  @JoinColumn({ name: 'bookTitleUuidRel' })
  bookTitleUuidRel: string;
}