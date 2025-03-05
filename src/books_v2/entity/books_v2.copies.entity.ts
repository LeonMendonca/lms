import { CreateDateColumn, UpdateDateColumn, Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BookTitle } from './books_v2.title.entity';

@Entity('book_copies')
export class BookCopy {
  @PrimaryGeneratedColumn('uuid', { name: 'book_copy_uuid' })
  bookCopyUUID: string;

  @ManyToOne(() => BookTitle, (bookTitle) => bookTitle.bookCopies)
  @JoinColumn({ name: 'book_uuid' })
  bookTitle: BookTitle;

  @Column({ name: 'call_number', type: 'char', length: 10, nullable: true })
  callNumber: string;

  @Column({ name: 'author_mark', type: 'varchar', length: 255 })
  authorMark: string;

  @Column({ name: 'source_of_acquisition', type: 'varchar', length: 255 })
  sourceOfAcquisition: string;

  @Column({ name: 'date_of_acquisition', type: 'date' })
  dateOfAcquisition: string;

  @Column({ name: 'bill_no', type: 'int' })
  billNo: number;

  @Column({ name: 'no_of_pages', type: 'int' })
  noOfPages: number;

  @Column({ name: 'no_of_preliminary_pages', type: 'int' })
  noOfPreliminaryPages: number;

  @Column({ name: 'language', type: 'varchar', length: 255 })
  language: string;

  @Column({ name: 'inventory_number', type: 'bigint', nullable: true })
  inventoryNumber: number;

  @Column({ name: 'accession_number', type: 'int' })
  accessionNumber: number;

  @Column({ name: 'barcode', type: 'varchar', length: 255 })
  barcode: string;

  @Column({ name: 'item_type', type: 'varchar', length: 255 })
  itemType: string;

  @Column({ name: 'institute_id', type: 'uuid', nullable: true })
  instituteId: string;

  @Column({
    name: 'is_archived',
    default: false,
    type: 'boolean',
    nullable: true,
  })
  isArchived: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ name: 'remarks', type: 'simple-array', nullable: true })
  remarks: string[];

  @Column({ name: 'images', type: 'simple-array', nullable: true })
  images: string[];

  @Column({ name: 'additional_fields', type: 'json', nullable: true })
  additionalFields: any;
  
  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'is_available', type: 'boolean', nullable: true, default: true })
  isAvailable: boolean;
}
