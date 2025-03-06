import { PrimaryGeneratedColumn, Entity, Column } from 'typeorm';

@Entity('book_count')
export class Bookcount {
  @PrimaryGeneratedColumn('uuid', { name: 'bookcount_id' })
  BookcountId: "bookcount_id" = "bookcount_id"

  @Column({ name: 'isbn', type: 'varchar', length: 255, nullable:true })
  isbn: "isbn" = 'isbn';

  @Column({ name: 'version', type: 'varchar', length: 255 })
  version: "version" = 'version';

  @Column({ name: 'book_title', type: 'varchar',  })
  createdbook_Title: "book_title" = 'book_title'; 

  @Column({ name: 'available_count', type: 'int', default: 1 })
  availableCount: "available_count" = 'available_count';

  @Column({ name: 'created_at', type: 'date', nullable:true })
  createdAt: "created_at" = 'created_at';

}
// book_uuid added