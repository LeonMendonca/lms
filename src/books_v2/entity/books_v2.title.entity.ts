import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BookCopy } from './books_v2.copies.entity';

@Entity('book_titles')
export class BookTitle {
  @PrimaryGeneratedColumn('uuid', { name: 'book_uuid' })
  bookUUID: 'book_uuid' = 'book_uuid';

  @Column({
    name: 'book_id',
    type: 'varchar',
    length: 255,
    unique: true,
    nullable: true,
  })
  bookId: 'book_id' = 'book_id';

  @Column({ name: 'book_title', type: 'varchar', length: 255 })
  bookTitle: 'book_title' = 'book_title';

  @Column({ name: 'book_author', type: 'varchar', length: 255 })
  bookAuthor: 'book_author' = 'book_author';

  @Column({ name: 'name_of_publisher', type: 'varchar', length: 255 })
  nameOfPublisher: 'name_of_publisher' = 'name_of_publisher';

  @Column({ name: 'place_of_publication', type: 'varchar', length: 255 })
  placeOfPublication: 'place_of_publication' = 'place_of_publication';

  @Column({ name: 'year_of_publication', type: 'date' })
  yearOfPublication: 'year_of_publication' = 'year_of_publication';

  @Column({ name: 'edition', type: 'varchar', length: 255 })
  edition: 'edition' = 'edition';

  @Column({ name: 'isbn', type: 'varchar', length: 255 })
  isbn: 'isbn' = 'isbn';

  @Column({ name: 'no_of_pages', type: 'integer' ,nullable:true })
  noPages: 'no_of_pages' = 'no_of_pages';

  @Column({ name: 'no_of_preliminary', type: 'integer', nullable:true })
  noPreliminary: 'no_of_preliminary' = 'no_of_preliminary';

  @Column({ name: 'subject', type: 'varchar', length: 255 })
  subject: 'subject' = 'subject';

  @Column({ name: 'department', type: 'varchar', length: 255 })
  department: 'department' = 'department';

  @Column({ name: 'call_number', type: 'varchar', length: 255, nullable: true })
  callNumber: 'call_number' = 'call_number';

  @Column({ name: 'author_mark', type: 'varchar', length: 255 })
  authorMark: 'author_mark' = 'author_mark';

  @Column({
    name: 'is_archived',
    default: false,
    type: 'boolean',
    nullable: true,
  })
  isArchived: 'is_archived' = 'is_archived';

  @Column({ name: 'total_count', type: 'int', nullable: true, default: 1 })
  totalCount: 'total_count' = 'total_count';

  @Column({ name: 'available_count', type: 'int', nullable: true, default: 1 })
  availableCount: 'available_count' = 'available_count';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: 'created_at' = 'created_at';

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: 'updated_at' = 'updated_at';

  @Column({ name: 'images', type: 'simple-array', nullable: true })
  images: 'images' = 'images';

  @Column({ name: 'additional_fields', type: 'json', nullable: true })
  additionalFields: 'additional_fields' = 'additional_fields';

  @Column({ name: 'description', type: 'text', nullable: true })
  description: 'description' = 'description';

  //Relationships
  @OneToMany(() => BookCopy, (bookcopy) => bookcopy.bookTitleUUID)
  bookCopies: 'book_copies' = 'book_copies';
}
