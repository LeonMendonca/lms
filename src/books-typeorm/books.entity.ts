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

  @Column({ name: 'call_number', type: 'numeric', precision: 10, scale: 0 })
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

  @Column({ name: 'inventory_number', type: 'int' })
  inventoryNumber: number;

  @Column({ name: 'accession_number', type: 'int' })
  accessionNumber: number;

  @Column({ name: 'barcode', type: 'varchar', length: 255 })
  barcode: string;

  @Column({ name: 'item_type', type: 'varchar', length: 255 })
  itemType: string;

  // ----- //
}
