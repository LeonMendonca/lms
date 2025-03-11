import { PrimaryGeneratedColumn, Entity, Column } from 'typeorm';

export const BOOK_STATUS = {
  RETURNED: 'returned',
  BORROWED: 'borrowed',
  BOOKLIBRARY:"setbooklibrary",
} as const;

@Entity('book_log')
export class Booklog {
  @PrimaryGeneratedColumn('uuid', { name: 'booklog_id' })
  bookId: "booklog_id" = "booklog_id"

  @Column({ name: 'book_uuid', type: 'varchar', length: 255, nullable:true })
  bookUUID: "book_uuid" = 'book_uuid';

  @Column({ name: 'book_title', type: 'varchar', length: 255 })
  bookTitle: "book_title" = 'book_title';

  @Column({ name: 'student_uuid', type: 'uuid' })
  studentuuid: "student_uuid" = 'student_uuid';

  @Column({ name: 'date', type: 'date', default: new Date().toISOString() })
  date: "date" = 'date';

  @Column({  name:'time' ,type:'timestamp' ,default: () => 'CURRENT_TIMESTAMP' })
  time:'time'='time';

  @Column({ name: 'returned_date', type: 'date', default: new Date().toISOString() })
  returned_date: "returned_date" = 'returned_date';

  @Column({ name: 'book_status', type: 'enum', enum: BOOK_STATUS })
  book_status: "book_status" ='book_status';
}
//namestud ,book name,time and date return date, status arew the fields