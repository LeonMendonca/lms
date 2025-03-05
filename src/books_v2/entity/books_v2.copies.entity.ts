import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BookTitle } from './books_v2.title.entity';

@Entity('book_copies')
export class BookCopy {
  @PrimaryGeneratedColumn('uuid', { name: 'copy_uuid' })
  copyUUID: string;

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

  @Column({ name: 'is_available', type: 'boolean', nullable: true, default: true })
  isAvailable: boolean;
}
