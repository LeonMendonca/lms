import { BookCopy } from "src/books_v2/entity/books_v2.copies.entity";
import { Students } from "src/students/students.entity";
import { Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, Entity, JoinColumn } from "typeorm";
import { string } from "zod";


export const CATEGORY = {
    BOOK: "book",
    PERIODICAL: "periodical"
} as const

@Entity('fees_penalties')
export class FeesPenalties {
    @PrimaryGeneratedColumn('uuid', { name: 'fp_uuid' })
    fpUUID: 'fp_uuid' = 'fp_uuid';

    @Column({ name: "category", type: "enum", enum: CATEGORY })
    category: 'category' = 'category';

    // @ManyToOne(() => Students, (student) => student.studentUUID)
    // @JoinColumn({ name: 'borrower_uuid' })
    @Column({ name: 'borrower_uuid', type: 'uuid' })
    borrowerUUID: 'borrower_uuid' = 'borrower_uuid';

    // @ManyToOne(() => BookCopy, (book_copy) => book_copy.bookCopyUUID)
    // @JoinColumn({ name: 'book_copy_uuid' })
    @Column({ name: 'copy_uuid', type: 'uuid' })
    CopyUUID: 'copy_uuid' = 'copy_uuid';

    @Column({ name: 'payment_method', type: 'varchar', nullable: true })
    paymentMethod: 'payment_method' = 'payment_method';

    @Column({ name: 'days_delayed', type: 'int', default: 0 })
    daysDelayed: 'days_delayed' = 'days_delayed';

    @Column({ name: 'penalty_amount', type: 'int', default: 0 })
    penaltyAmount: 'penalty_amount' = 'penalty_amount';

    @Column({ name: 'paid_amount', type: 'int', default: 0 })
    paidAmount: 'paid_amount' = 'paid_amount';

    @Column({ name: 'is_penalised', type: 'bool', default: false })
    isPenalised: 'is_penalised' = 'is_penalised';

    @Column({ name: 'return_date', type: 'date' })
    returnDate: 'return_date' = 'return_date';

    @Column({ name: 'returned_at', type: 'date', nullable: true })
    returnedAt: 'returned_at' = 'returned_at';

    @CreateDateColumn({ name: 'created_at' })
    createdAt: 'created_at' = 'created_at';

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: 'updated_at' = 'updated_at';

    @Column({ name: 'is_completed', type: 'bool', default: false })
    isCompleted: 'is_completed' = 'is_completed';
}

export const fees_penalties = new FeesPenalties();

export type TFeesPenalties = {
    [P in keyof typeof fees_penalties as typeof fees_penalties[P]]: any
}