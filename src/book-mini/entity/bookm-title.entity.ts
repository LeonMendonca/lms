import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity('book_mini_title')
export class BookMiniTitle {
  @PrimaryGeneratedColumn('uuid', { name: 'book_title_uuid' })
  bookTitleUUID: "book_title_uuid" = "book_title_uuid";

  @Column({ name: 'book_title', type: 'varchar', length: 255 })
  bookTitle: "book_title" = "book_title";

  @Column({ name: 'isbn', type: 'varchar', length: 255 })
  isbn: "isbn" = "isbn";

  @Column({ name: 'available_count', type:'int', default: 1 })
  availableCount: "available_count" = "available_count";

  @Column({ name: 'total_count', type:'int', default: 1 })
  totalCount: "total_count" = "total_count";
}
