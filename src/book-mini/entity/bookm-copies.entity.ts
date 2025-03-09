import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity('book_mini_copies')
export class BookMiniCopies {

  @PrimaryGeneratedColumn('uuid', { name: 'book_copies_uuid' })
  bookCopiesUUID: "book_copies_uuid" = "book_copies_uuid";

  @Column({ name: 'book_title', type: 'varchar', length: 255 })
  bookTitle: "book_title" = "book_title";

  @Column({ name: 'book_author', type: 'varchar', length: 255 })
  bookAuthor: "book_author" = "book_author";

  @Column({ name: 'isbn', type: 'varchar', length: 255 })
  isbn: "isbn" = "isbn";

}
