import {
  PrimaryGeneratedColumn,
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { BookTitle } from './books_v2.title.entity';
import { BookCopy } from './books_v2.copies.entity';
import { StudentsData } from 'src/students/entities/student.entity';

@Entity('book_logv2')
export class Booklog_v2 {
  @PrimaryGeneratedColumn('uuid', { name: 'booklogId' })
  booklogId: string;

  //student uuid
  @ManyToOne(() => StudentsData, (students) => students.studentUuid)
  @JoinColumn({ name: 'borrowerUuid' })
  borrowerUuid: string;

  @ManyToOne(() => BookTitle, (book_title) => book_title.bookUuid)
  @JoinColumn({ name: 'bookUuuid' })
  bookUuuid: string;

  @ManyToOne(() => BookCopy, (book_copy) => book_copy.bookCopyUuid)
  @JoinColumn({ name: 'bookCopyUuid' })
  bookCopyUuid: string;

  @Column({ name: 'oldBookCopy', type: 'json', nullable: true })
  oldBookCopy: Record<string, any>;

  @Column({ name: 'newBookCopy', type: 'json', nullable: true })
  newBookCopy: Record<string, any>;

  @Column({ name: 'oldBookTitle', type: 'json', nullable: true})
  oldBookTitle: Record<string, any>;

  @Column({ name: 'newBookTitle', type: 'json', nullable: true })
  newBookTitle: Record<string, any>;

  @Column({ name: 'action', type: 'varchar', length: 255 })
  action: string;

  @Column({ name: 'description', type: 'varchar', length: 255, nullable: true })
  description: string;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @Column({ name: 'ipAddress', type: 'varchar', length: 255, nullable: true })
  ipAddress: string;

  @Column({ name: 'instituteUuid', type: 'uuid', nullable: true })
  instituteUuid: string;

  @Column({ name: 'instituteName', type: 'varchar', nullable: true })
  instituteName: string;

  @Column({ name: 'isReturned', type: 'boolean', default: false })
  isReturned: boolean;

  @Column({ name: 'expectedDate', type: 'date', nullable: true })
  expectedDate: Date;
}
