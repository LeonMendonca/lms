import { PrimaryGeneratedColumn, Entity, Column } from 'typeorm';

@Entity('books_table')
export class Books {
  @PrimaryGeneratedColumn('uuid', { name: 'book_id' })
  bookId: string;

  //Bibliographic information

  @Column({ name: 'book_title', type: 'varchar', length: 255 })
  bookTitle: string;

  @Column({ name: 'book_author', type: 'varchar', length: 255 })
  bookAuthor: string;

  @Column({ name: 'name_of_publisher', type: 'varchar', length: 255 })
  nameOfPublisher: string;

  @Column({ name: 'place_of_publication', type: 'varchar', length: 255 })
  placeOfPublication: string;

  @Column({ name: 'year_of_publication', type: 'date' })
  yearOfPublication: Date;

  @Column({ name: 'language', type: 'varchar', length: 255 })
  language: string;

  @Column({ name: 'edition', type: 'varchar', length: 255 })
  edition: string;

  @Column({ name: 'isbn', type: 'varchar', length: 255 })
  ISBN: string;

  @Column({ name: 'no_of_pages', type: 'int' })
  noOfPages: number;

  @Column({ name: 'no_of_preliminary_pages', type: 'int' })
  noOfPreliminaryPages: number;

  @Column({ name: 'subject', type: 'varchar', length: 255 })
  subject: string;

  @Column({ name: 'department', type: 'varchar', length: 255 })
  department: string;

  // ----- //

  //Catologing and Classification

  @Column({ name: 'call_number', type: 'char', length: 10, nullable: true })
  callNumber: number;

  @Column({ name: 'author_mark', type: 'varchar', length: 255 })
  authorMark: `#${string}`;

  // ----- //

  // Acquisition Details

  @Column({ name: 'source_of_acquisition', type: 'varchar', length: 255 })
  sourceOfAcquisition: string;

  @Column({ name: 'date_of_acquisition', type: 'date' })
  dateOfAcquisition: Date;

  @Column({ name: 'bill_no', type: 'int' })
  billNo: number;

  // ----- //

  //Inventory and Identification

  @Column({ name: 'inventory_number', type: 'bigint', nullable: true })
  inventoryNumber: number;

  @Column({ name: 'accession_number', type: 'int' })
  accessionNumber: number;

  @Column({ name: 'barcode', type: 'varchar', length: 255 })
  barcode: string;

  @Column({ name: 'item_type', type: 'varchar', length: 255 })
  itemType: string;

  // ----- //

  //Institute
  @Column({ name: 'institute_id', type: 'uuid', nullable: true })
  instituteId: string;
  // ----- //

  @Column({
    name: 'is_archived',
    default: false,
    type: 'boolean',
    nullable: true,
  })
  isArchived: boolean;

  @Column({ name: 'available_books', type: 'int', nullable: true, default: 1 })
  availableBooks: number;
  @Column({ name: 'total_books', type: 'int', nullable: true, default: 1 })
  totalBooks: number;
}
