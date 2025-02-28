import { Console } from 'console';
import { PrimaryGeneratedColumn, Entity, Column } from 'typeorm';

export const BOOK_STATUS = {
  RETURNED: 'returned',
  BORROWED: 'borrowed',
} as const;

@Entity('book_log')
export class Booklog {
  @PrimaryGeneratedColumn('uuid', { name: 'booklog_id' })
  booklogId: string = '';

  @Column({ name: 'book_uuid', type: 'varchar', length: 255 })
  bookUuid: string = '';

  @Column({ name: 'book_title', type: 'varchar', length: 255 })
  bookTitle: string = '';

  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string = '';

  @Column({ name: 'date', type: 'date', default: new Date().toISOString() })
  date: Date = new Date();

  @Column({ name: 'department', type: 'varchar', length: 255 })
  department: string = '';

  @Column({ name: 'borrowed_by', type: 'uuid' })
  borrowedBy: string = '';

  @Column({ name: 'book_status', type: 'enum', enum: BOOK_STATUS })
  bookStatus: keyof typeof BOOK_STATUS | '' = '';
}

const obj = new Booklog()

export function Log() {

  let key = Object.keys(obj);
  console.log(key);
  
  const snakeCaseObj = key.map((item) => {
    console.log("Key", item)
    // Convert key to snake_case
    return item.replace(/([A-Z])/g, '_$1').toLowerCase();
  });

  return snakeCaseObj;
}

export function ObjectBuilder(arr: string[]) {
  let obj = new Object();
  arr.map((item) => {
    obj[item] = '';
  })
  return obj;
}

// books log
// books uuid
// Book Title
// student uuid
// Issue Date
// Due Date
// Return Date
// department
//book status
