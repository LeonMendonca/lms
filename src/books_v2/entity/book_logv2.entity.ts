import { Students } from 'src/students/students.entity';
import { PrimaryGeneratedColumn, Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BookTitle } from './books_v2.title.entity';
import { BookCopy } from './books_v2.copies.entity';
import { FeesPenalties } from 'src/fees-penalties/fees-penalties.entity';



@Entity('book_logv2')
export class Booklog_v2 {
  @PrimaryGeneratedColumn('uuid', { name: 'booklog_uuid' })
  booklogId: "booklog_id" = "booklog_id"

  //student uuid
  @ManyToOne(() => Students, (students) => students.studentUUID)
  @JoinColumn({ name: "borrower_uuid" })
  borrowerUUID: 'borrower_uuid' = 'borrower_uuid';

  @ManyToOne(() => BookTitle, (book_title) => book_title.bookUUID)
  @JoinColumn({ name: "book_title_uuid" })
  bookUUID: 'book_title_uuid' = 'book_title_uuid';

  @ManyToOne(() => BookCopy, (book_copy) => book_copy.bookCopyUUID)

  @JoinColumn({ name: 'book_copy_uuid' })
  bookCopyUUID: 'book_copy_uuid' = 'book_copy_uuid';

  @Column({ name: 'old_book_copy', type: 'jsonb' })
  oldBookCopy: 'old_book_copy' = "old_book_copy";

  @Column({ name: 'new_book_copy', type: 'jsonb' })
  newBookCopy: 'new_book_copy' = "new_book_copy";


  @Column({ name: 'old_book_title', type: 'jsonb' })
  oldBookTitle: 'old_book_copy' = "old_book_copy";

  @Column({ name: 'new_book_title', type: 'jsonb' })
  newBookTitle: 'old_book_copy' = "old_book_copy";

  @Column({ name: 'action', type: 'varchar', length: 255 })
  action: "action" = 'action';

  @Column({ name: 'description', type: 'varchar', length: 255 })
  description: 'description' = 'description';

  @Column({ name: 'time', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  time: 'time' = 'time';

  @Column({ name: 'date', type: 'date', default: () => 'CURRENT_DATE' })
  date: 'date' = 'date';


  @Column({ name: 'ip_address', type: 'varchar', length: 255, nullable: true })
  ipAddress: 'ip_address' = 'ip_address';

  @ManyToOne(() => FeesPenalties, (fees_penalties) => fees_penalties.fpUUID)
  @JoinColumn({ name: 'fp_uuid' })
  fpUUID: 'fp_uuid' = 'fp_uuid';

}

export const booklogV2 = new Booklog_v2();

export type TBooklog_v2 = {
  [P in keyof typeof booklogV2 as typeof booklogV2[P]]: any;
}