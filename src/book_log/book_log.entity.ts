import { PrimaryGeneratedColumn, Entity, Column } from 'typeorm';

export const BOOK_STATUS = {
    RETURNED: 'returned',
    BORROWED: 'borrowed',
} as const;

@Entity('book_log')
export class Booklog {
    @PrimaryGeneratedColumn('uuid', { name: 'booklog_id' })
    booklogId: "booklog_id" = 'booklog_id';

    @Column({ name: 'book_uuid', type: 'varchar', length: 255 })
    bookUUID: "book_uuid" = 'book_uuid';

    @Column({ name: 'book_title', type: 'varchar', length: 255 })
    bookTitle: "book_title" = 'book_title';

    @Column({ name: 'student_id', type: 'uuid' })
    studentId: "student_id" = 'student_id';

    @Column({ name: 'date', type: 'date', default: new Date() })
    date: "date" = "date";

    @Column({ name: 'department', type: 'varchar', length: 255 })
    department: "department" = 'department';

    @Column({ name: 'borrowed_by', type: 'uuid' })
    borrowedBy: "borrowed_by" = 'borrowed_by';

    @Column({ name: 'book_status', type: 'enum', enum: BOOK_STATUS })
    bookStatus: "book_status" = "book_status";
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
