import { Students } from 'src/students/students.entity';
import { PrimaryGeneratedColumn, Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BookTitle } from './books_v2.title.entity';
import { BookCopy } from './books_v2.copies.entity';



@Entity('book_logv2')
export class Booklog_v2 {
  @PrimaryGeneratedColumn('uuid', { name: 'booklog_uuid' })
  booklogId: "booklog_id" = "booklog_id"

  //student uuid
  @ManyToOne(() => Students, (students) => students.studentUUID)
  @JoinColumn({ name: "borrower_uuid" })
  borrowerId:'borrower_uuid'='borrower_uuid'; 

  @ManyToOne(() => BookTitle, (book_title) => book_title.bookUUID)
  @JoinColumn({ name: "book_title_uuid" })
  bookUUID:'book_title_uuid'='book_title_uuid'; 

  @ManyToOne(() => BookCopy, (book_copy) => book_copy.bookCopyUUID)
  @JoinColumn({ name:'book_copy_uuid' })
  bookCopyUUID:'book_copy_uuid'='book_copy_uuid'; 

  //@Column({ name: 'old_booktitle', type: 'json',  nullable:true })
  //oldBookTitle: "old_booktitle" = 'old_booktitle';

  //@Column({ name: 'new_booktitle', type: 'json',  nullable: true })
  //newBookTitle: "new_booktitle" = 'new_booktitle';

  //@Column({ name: 'old_bookcopy', type: 'json', nullable:true })
  //oldBookCopy: "old_bookcopy" = 'old_bookcopy';

  //@Column({ name: 'new_bookcopy', type: 'json', nullable: true })
  //newBookCopy: "new_bookcopy" = 'new_bookcopy'
  
  @Column({ name: 'action', type: 'varchar', length:255 })
  action: "action" = 'action';

  @Column({  name:'description' ,type:'varchar', length:255  })
  description:'description'='description'; 

  @Column({  name:'time' ,type:'timestamp' ,default: () => 'CURRENT_TIMESTAMP' })
  time:'time'='time';

} 
