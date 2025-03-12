import { PrimaryGeneratedColumn, Entity, Column } from 'typeorm';



@Entity('book_logv2')
export class Booklog_v2 {
  @PrimaryGeneratedColumn('uuid', { name: 'booklog_id' })
  logId: "log_id" = "log_id"

  @Column({ name: 'person', type: 'uuid'})
  personId: "person" = 'person';

  @Column({  name:'borrower_uuid' ,type:'uuid' })
  borrowerId:'borrower_uuid'='borrower_uuid'; 

  @Column({  name:'book_uuid' ,type:'uuid' ,  nullable:true })
  bookUUID:'book_uuid'='book_uuid'; 

  @Column({  name:'book_copy_uuid' ,type:'uuid' ,  nullable:true })
  bookCopyUUID:'book_copy_uuid'='book_copy_uuid'; 

  @Column({ name: 'old_booktitle', type: 'json',  nullable:true })
  oldBookTitle: "old_booktitle" = 'old_booktitle';

  @Column({ name: 'new_booktitle', type: 'json',  nullable: true })
  newBookTitle: "new_booktitle" = 'new_booktitle';

  @Column({ name: 'old_bookcopy', type: 'json', nullable:true })
  oldBookCopy: "old_bookcopy" = 'old_bookcopy';

  @Column({ name: 'new_bookcopy', type: 'json', nullable: true })
  newBookCopy: "new_bookcopy" = 'new_bookcopy'
  
  @Column({ name: 'action', type: 'varchar', length:255 })
  action: "action" = 'action';

  @Column({  name:'description' ,type:'varchar', length:255  })
  description:'description'='description'; 

  @Column({  name:'ip_address' ,type:'varchar' ,length:255  })
  ipAddress:'ip_address'='ip_address'; 

  @Column({  name:'time' ,type:'timestamp' ,default: () => 'CURRENT_TIMESTAMP' })
  time:'time'='time';

} 
