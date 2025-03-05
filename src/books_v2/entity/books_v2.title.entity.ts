import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { BookCopy } from './books_v2.copies.entity';

@Entity('book_titles')
export class BookTitle {
  @PrimaryGeneratedColumn('uuid', { name: 'book_uuid' })
  bookUUID: string;

  @Column({ name: 'book_id', type: 'varchar', length: 255, unique: true })
  bookId: string;

  // Bibliographic information
  @Column({ name: 'book_title', type: 'varchar', length: 255 })
  bookTitle: string;

  @Column({ name: 'book_author', type: 'varchar', length: 255 })
  bookAuthor: string;

  @Column({ name: 'name_of_publisher', type: 'varchar', length: 255 })
  nameOfPublisher: string;

  @Column({ name: 'place_of_publication', type: 'varchar', length: 255 })
  placeOfPublication: string;

  @Column({ name: 'year_of_publication', type: 'date' })
  yearOfPublication: string;

  @Column({ name: 'language', type: 'varchar', length: 255 })
  language: string;

  @Column({ name: 'edition', type: 'varchar', length: 255 })
  edition: string;

  @Column({ name: 'isbn', type: 'varchar', length: 255 })
  isbn: string;

  @Column({ name: 'no_of_pages', type: 'int' })
  noOfPages: number;

  @Column({ name: 'no_of_preliminary_pages', type: 'int' })
  noOfPreliminaryPages: number;

  @Column({ name: 'subject', type: 'varchar', length: 255 })
  subject: string;

  @Column({ name: 'department', type: 'varchar', length: 255 })
  department: string;

  // Relationships
  @OneToMany(() => BookCopy, (bookCopy) => bookCopy.bookTitle)
  bookCopies: BookCopy[];
}
