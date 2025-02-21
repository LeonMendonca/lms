import { PrimaryGeneratedColumn, Entity, Column } from 'typeorm';

@Entity('books_table')
export class Books {
  @PrimaryGeneratedColumn('uuid', { name: 'book_id' })
  bookId: string;

  @Column({ name: 'book_name', type: 'varchar', length: 255 })
  bookName: string;

  @Column({ name: 'name_of_publisher', type: 'varchar', length: 255 })
  nameOfPublisher: string;

  @Column({ name: 'place_of_publication', type: 'varchar', length: 255 })
  placeOfPublication: string;

  @Column({ name: '', type: 'varchar', length: 255 })
  name: string;
  @Column({ name: 'language', type: 'varchar', length: 255 })
  language: string;

  @Column({ name: 'no_of_pages', type: 'int' })
  noOfPages: number;

  @Column({ name: 'department', type: 'varchar', length: 255 })
  department: string;

  @Column({ name: 'source_of_acquisition', type: 'varchar', length: 255 })
  sourceOfAcquisition: string;

  @Column({ name: 'book_price', type: 'int' })
  bookPrice: number;

  @Column({ name: 'item_type', type: 'varchar', length: 255 })
  itemType: string;

  @Column({ name: 'barcode', type: 'varchar', length: 255 })
  barcode: string;

  @Column({ name: 'bill_no', type: 'varchar', length: 255 })
  billNo: string;
}
