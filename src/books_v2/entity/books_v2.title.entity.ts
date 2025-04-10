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
  @PrimaryGeneratedColumn('uuid', { name: 'bookUuid' })
  bookUuid: string;

  @Column({
    name: 'bookTitleId',
    type: 'varchar',
    length: 255,
    nullable: true
  })
  bookTitleId: string;

  @Column({ name: 'accessionNumber', type: 'varchar', nullable: true })
  accessionNumber: string;

  @Column({ name: 'categoryName', type: 'varchar', nullable: true })
  categoryName: string;

  @Column({ name: 'classificationNumber', type: 'varchar', nullable: true })
  classificationNumber: string;

  @Column({ name: 'author1', type: 'varchar', nullable: true })
  author1: string;

  @Column({ name: 'author2', type: 'varchar', nullable: true })
  author2: string;

  @Column({ name: 'otherAuthors', type: 'varchar', nullable: true })
  otherAuthors: string;

  @Column({ name: 'authorType1', type: 'varchar', nullable: true })
  authorType1: string;

  @Column({ name: 'authorType2', type: 'varchar', nullable: true })
  authorType2: string;

  @Column({ name: 'otherAuthorsType', type: 'varchar', nullable: true })
  otherAuthorsType: string;

  @Column({ name: 'bookTitle', type: 'varchar', nullable: true })
  bookTitle: string;

  @Column({ name: 'publisher', type: 'varchar', nullable: true })
  publisher: string;

  @Column({ name: 'place', type: 'varchar', nullable: true })
  place: string;

  @Column({ name: 'yearOfPublication', type: 'varchar', nullable: true })
  yearOfPublication: string;

  @Column({ name: 'romanPages', type: 'varchar', nullable: true })
  romanPages: string;

  @Column({ name: 'numbericPages', type: 'varchar', nullable: true })
  numbericPages: string;

  @Column({ name: 'isbn', type: 'varchar' })
  isbn: string;

  @Column({ name: 'instituteName', type: 'varchar' })
  instituteName: string;

  @Column({ name: 'instituteUuid', type: 'uuid' })
  instituteUuid: string;

  @Column({ name: 'keyWords', type: 'simple-array' })
  keyWords: string[];

  @Column({ name: 'titleRemarks', type: 'simple-array' })
  titleRemarks: string[];

  @Column({ name: 'subjectName', type: 'varchar' })
  subjectName: string;

  @Column({ name: 'subSubjectName', type: 'varchar' })
  subSubjectName: string;

  @Column({ name: 'language', type: 'varchar' })
  language: string;

  @Column({ name: 'bookSeries', type: 'varchar' })
  bookSeries: string;

  @Column({ name: 'departent', type: 'varchar' })
  departent: string;

  @Column({ name: 'edition', type: 'varchar' })
  edition: string;
  
  @Column({ name: 'titleImages', type: 'varchar', nullable: true })
  titleImages: string;

  @Column({ name: 'totalCount', type: 'int',  default: 1 })
  totalCount: number;

  @Column({ name: 'availableCount', type: 'int', default: 1 })
  availableCount: number;

  @CreateDateColumn({ name: 'createdAt'})
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;

  //Relationships
  @OneToMany(() => BookCopy, (bookcopy) => bookcopy.bookTitleUuidRel)
  bookCopiesUuidRel: BookCopy[];
}
