import { PrimaryGeneratedColumn, Entity, Column } from 'typeorm';

export const BOOK_STATUS = {
  RETURNED: 'returned',
  BORROWED: 'borrowed',
} as const;

@Entity('book_log')
export class Booklog {
  @PrimaryGeneratedColumn('uuid', { name: 'booklog_id' })
  bookId: "booklog_id" = "booklog_id"

  @Column({ name: 'book_uuid', type: 'varchar', length: 255, nullable:true })
  bookUUID: "book_uuid" = 'book_uuid';

  @Column({ name: 'book_title', type: 'varchar', length: 255 })
  bookTitle: "book_title" = 'book_title';

  @Column({ name: 'student_id', type: 'uuid' })
  studentId: "student_id" = 'student_id';

  @Column({ name: 'date', type: 'date', default: new Date().toISOString() })
  date: "date" = 'date';

  @Column({ name: 'book_status', type: 'enum', enum: BOOK_STATUS })
  // bookStatus: keyof typeof BOOK_STATUS | '' = '';
  book_status: "book_status" ='book_status';
}