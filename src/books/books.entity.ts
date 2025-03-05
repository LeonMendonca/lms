import { PrimaryGeneratedColumn, Entity, Column } from 'typeorm';

@Entity('books_table')
export class Books {
  @PrimaryGeneratedColumn('uuid', { name: 'book_uuid' })
  bookUUID: "book_uuid" = "book_uuid";

  // Bibliographic information

  @Column({ name: 'book_title', type: 'varchar', length: 255 })
  bookTitle: "book_title" = "book_title";

  @Column({ name: 'book_author', type: 'varchar', length: 255 })
  bookAuthor: "book_author" = "book_author";

  @Column({ name: 'name_of_publisher', type: 'varchar', length: 255 })
  nameOfPublisher: "name_of_publisher" = "name_of_publisher";

  @Column({ name: 'place_of_publication', type: 'varchar', length: 255 })
  placeOfPublication: "place_of_publication" = "place_of_publication";

  @Column({ name: 'year_of_publication', type: 'date' })
  yearOfPublication: "year_of_publication" = "year_of_publication";

  @Column({ name: 'language', type: 'varchar', length: 255 })
  language: "language" = "language";//bc

  @Column({ name: 'edition', type: 'varchar', length: 255 })
  edition: "edition" = "edition";

  @Column({ name: 'isbn', type: 'varchar', length: 255 })
  isbn: "isbn" = "isbn";

  @Column({ name: 'no_of_pages', type: 'int' })
  noOfPages: "no_of_pages" = "no_of_pages";//bc

  @Column({ name: 'no_of_preliminary_pages', type: 'int' })
  noOfPreliminaryPages: "no_of_preliminary_pages" = "no_of_preliminary_pages";//bc

  @Column({ name: 'subject', type: 'varchar', length: 255 })
  subject: "subject" = "subject";

  @Column({ name: 'department', type: 'varchar', length: 255 })
  department: "department" = "department";

  // ----- //

  // Cataloging and Classification

  @Column({ name: 'call_number', type: 'char', length: 10, nullable: true })
  callNumber: "call_number" = "call_number";

  @Column({ name: 'author_mark', type: 'varchar', length: 255 })
  authorMark: "author_mark" = "author_mark";

  // ----- //

  // Acquisition Details

  @Column({ name: 'source_of_acquisition', type: 'varchar', length: 255 })
  sourceOfAcquisition: "source_of_acquisition" = "source_of_acquisition";//bc

  @Column({ name: 'date_of_acquisition', type: 'date' })//bc
  dateOfAcquisition: "date_of_acquisition" = "date_of_acquisition";

  @Column({ name: 'bill_no', type: 'int' })
  billNo: "bill_no" = "bill_no";//bc

  // ----- //

  // Inventory and Identification

  @Column({ name: 'inventory_number', type: 'bigint', nullable: true })
  inventoryNumber: "inventory_number" = "inventory_number";//bc

  @Column({ name: 'accession_number', type: 'int' })
  accessionNumber: "accession_number" = "accession_number";//bc

  @Column({ name: 'barcode', type: 'varchar', length: 255 })
  barcode: "barcode" = "barcode";//bx

  @Column({ name: 'item_type', type: 'varchar', length: 255 })
  itemType: "item_type" = "item_type";//bc

  // ----- //

  // Institute
  @Column({ name: 'institute_id', type: 'uuid', nullable: true })
  instituteId: "institute_id" = "institute_id";//bc

  // ----- //

  @Column({
    name: 'is_archived',
    default: false,
    type: 'boolean',
    nullable: true,
  })//bc
  isArchived: "is_archived" = "is_archived";

  @Column({ name: 'total_count', type: 'int', nullable: true, default: 1 })
  totalCount: "total_count" = "total_count";

  @Column({ name: 'available_count', type: 'int', nullable: true, default: 1 })
  availableCount: "available_count" = "available_count";

  //createdby
  //createdat
  //updated at
  //images
  // remarks
  //.json
}
