import { CreateDateColumn, UpdateDateColumn, Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BookTitle } from './books_v2.title.entity';

@Entity('book_copies')
export class BookCopy {
  @PrimaryGeneratedColumn('uuid', { name: 'book_copy_uuid' })
  bookCopyUUID: "book_copy_uuid" = "book_copy_uuid";

  @ManyToOne(() => BookTitle, (bookTitle) => bookTitle.bookCopies)
  @JoinColumn({ name: 'book_uuid' })
  bookTitle: "book_title" = "book_title";

  @Column({ name: 'call_number', type: 'char', length: 10, nullable: true })
  callNumber: "call_number" = "call_number";

  @Column({ name: 'author_mark', type: 'varchar', length: 255 })
  authorMark: "author_mark" = "author_mark";

  @Column({ name: 'source_of_acquisition', type: 'varchar', length: 255 })
  sourceOfAcquisition: "source_of_acquisition" = "source_of_acquisition";

  @Column({ name: 'date_of_acquisition', type: 'date' })
  dateOfAcquisition: "date_of_acquisition" = "date_of_acquisition";

  @Column({ name: 'bill_no', type: 'int' })
  billNo: "bill_no" = "bill_no";

  @Column({ name: 'no_of_pages', type: 'int' })
  noOfPages: "no_of_pages" = "no_of_pages";

  @Column({ name: 'no_of_preliminary_pages', type: 'int' })
  noOfPreliminaryPages: "no_of_preliminary_pages" = "no_of_preliminary_pages";

  @Column({ name: 'language', type: 'varchar', length: 255 })
  language: "language" = "language";

  @Column({ name: 'inventory_number', type: 'bigint', nullable: true })
  inventoryNumber: "inventory_number" = "inventory_number";

  @Column({ name: 'accession_number', type: 'int' })
  accessionNumber: "accession_number" = "accession_number";

  @Column({ name: 'barcode', type: 'varchar', length: 255 })
  barcode: "barcode" = "barcode";

  @Column({ name: 'item_type', type: 'varchar', length: 255 })
  itemType: "item_type" = "item_type";

  @Column({ name: 'institute_id', type: 'uuid', nullable: true })
  instituteId: "institute_id" = "institute_id";

  @Column({
    name: 'is_archived',
    default: false,
    type: 'boolean',
    nullable: true,
  })
  isArchived: "is_archived" = "is_archived";

  @CreateDateColumn({ name: 'created_at' })
  createdAt: "created_at" = "created_at";

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: "updated_at" = "updated_at";

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: "created_by" = "created_by";

  @Column({ name: 'remarks', type: 'simple-array', nullable: true })
  remarks: "remarks" = "remarks";

  @Column({ name: 'images', type: 'simple-array', nullable: true })
  images: "images" = "images";

  @Column({ name: 'additional_fields', type: 'json', nullable: true })
  additionalFields: "additional_fields" = "additional_fields";
  
  @Column({ name: 'description', type: 'text', nullable: true })
  description: "description" = "description";

  @Column({ name: 'is_available', type: 'boolean', nullable: true, default: true })
  isAvailable: "is_available" = "is_available";
}
