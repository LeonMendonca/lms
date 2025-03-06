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
  yearOfPublication: Date;

  @Column({ name: 'edition', type: 'varchar', length: 255 })
  edition: string;

  @Column({ name: 'isbn', type: 'varchar', length: 255 })
  isbn: string;

  @Column({ name: 'subject', type: 'varchar', length: 255 })
  subject: string;

  @Column({ name: 'department', type: 'varchar', length: 255 })
  department: string;

  @Column({ name: 'call_number', type: 'char', length: 10, nullable: true })
  callNumber?: string;

  @Column({ name: 'author_mark', type: 'varchar', length: 255 })
  authorMark: string;

  @Column({
    name: 'is_archived',
    type: 'boolean',
    default: false,
    nullable: true,
  })
  isArchived?: boolean;

  @Column({ name: 'total_count', type: 'int' })
  totalCount: number;

  @Column({ name: 'avaliable_count', type: 'int' })
  availableCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy?: string;

  @Column({ name: 'remarks', type: 'simple-array', nullable: true })
  remarks?: string[];

  @Column({ name: 'images', type: 'simple-array', nullable: true })
  images?: string[];

  @Column({ name: 'additional_fields', type: 'json', nullable: true })
  additionalFields?: Record<string, any>;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @Column({
    name: 'current_status',
    type: 'enum',
    enum: ['AVAILABLE', 'BORROWED'],
    default: 'AVAILABLE',
  })
  currentStatus: 'AVAILABLE' | 'BORROWED';

  // Relationships
  @OneToMany(() => BookCopy, (bookCopy) => bookCopy.bookTitle)
  bookCopies: BookCopy[];
}
