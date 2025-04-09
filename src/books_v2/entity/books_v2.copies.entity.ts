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
import { VisitLog } from 'src/students/entities/visitlog.entity';

@Entity('book_copies')
export class BookCopy {
  @PrimaryGeneratedColumn('uuid', { name: 'book_copy_uuid' })
  bookCopyUUID: 'book_copy_uuid' = 'book_copy_uuid';

  @Column({
    name: 'book_copy_id',
    type: 'varchar',
    length: 255,
    unique: true,
    nullable: true,
  })
  bookCopyId: 'book_copy_id' = 'book_copy_id';

  @Column({ name: 'source_of_acquisition', type: 'varchar', length: 255 })
  sourceOfAcquisition: 'source_of_acquisition' = 'source_of_acquisition';

  @Column({ name: 'date_of_acquisition', type: 'date' })
  dateOfAcquisition: 'date_of_acquisition' = 'date_of_acquisition';

  @Column({ name: 'bill_no', type: 'varchar', nullable: true })
  billNo: 'bill_no' = 'bill_no';

  @Column({ name: 'language', type: 'varchar', length: 255 })
  language: 'language' = 'language';

  @Column({ name: 'inventory_number', type: 'varchar', nullable: true })
  inventoryNumber: 'inventory_number' = 'inventory_number';

  @Column({ name: 'accession_number', type: 'varchar', nullable: true })
  accessionNumber: 'accession_number' = 'accession_number';

  @Column({ name: 'barcode', type: 'varchar', length: 255 })
  barcode: 'barcode' = 'barcode';

  @Column({ name: 'item_type', type: 'varchar', length: 255 })
  itemType: 'item_type' = 'item_type';

  @Column({ name: 'institute_name', type: 'varchar', nullable: true })
  instituteName: 'institute_name' = 'institute_name';

  @Column({ name: 'institute_uuid', type: 'uuid', nullable: true })
  instituteUUID: 'institute_uuid' = 'institute_uuid';

  @Column({
    name: 'is_archived',
    default: false,
    type: 'boolean',
    nullable: true,
  })
  isArchived: 'is_archived' = 'is_archived';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: 'created_at' = 'created_at';

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: 'updated_at' = 'updated_at';

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: 'created_by' = 'created_by';

  @Column({ name: 'remarks', type: 'simple-array', nullable: true })
  remarks: 'remarks' = 'remarks';

  @Column({ name: 'copy_images', type: 'simple-array', nullable: true })
  copyImages: 'copy_images' = 'copy_images';

  @Column({ name: 'copy_additional_fields', type: 'json', nullable: true })
  copyAdditionalFields: 'copy_additional_fields' = 'copy_additional_fields';

  @Column({ name: 'copy_description', type: 'text', nullable: true })
  copyDescription: 'copy_description' = 'copy_description';

  @Column({
    name: 'is_available',
    type: 'boolean',
    nullable: true,
    default: true,
  })
  isAvailable: 'is_available' = 'is_available';

  @ManyToOne(() => BookTitle, (bookTitle) => bookTitle.bookCopies)
  @JoinColumn({ name: 'book_title_uuid' })
  bookTitleUUID: 'book_title_uuid' = 'book_title_uuid';

  //@ManyToOne(() => VisitLog, (visitlog) => visitlog.visitlogId)
  //@JoinColumn({ name:"book_copy_visitlog_id" })
  //visitlogId:'visitlogid' = 'visitlogid';
}

const book_copy = new BookCopy();

export const bookCopyObject = {
  source_of_acquisition: 'source_of_acquisition_placeholder',
  date_of_acquisition: 'date_of_acquisition_placeholder',
  bill_no: 'bill_no_placeholder',
  language: 'language_placeholder',
  inventory_number: 'inventory_number_placeholder',
  accession_number: 'accession_number_placeholder',
  barcode: 'barcode_placeholder',
  item_type: 'item_type_placeholder',
  institute_name: 'institute_name_placeholder',
  institute_uuid: 'institute_uuid_placeholder',
  created_by: 'created_by_placeholder',
  remarks: 'remarks_placeholder',
  copy_images: 'copy_images_placeholder',
  copy_additional_fields: 'copy_additional_fields_placeholder',
  copy_description: 'copy_description_placeholder',
  book_title_uuid: 'book_title_uuid_placeholder',
} as const;

//Type that represents the table Columns
export type TBookCopy = {
  [P in keyof typeof book_copy as (typeof book_copy)[P]]: any;
};
