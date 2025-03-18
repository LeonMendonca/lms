import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, Generated, JoinColumn } from 'typeorm';
import { TrialTable } from './trial_table.entity';

@Entity('trial_copy')
export class TrialCopy {
    @PrimaryGeneratedColumn()
    id: number;

    // @Column({ type: 'uuid' })
    // uuid: string;

    @Column({ type: 'varchar', length: 255 })
    journal_name: string;

    @ManyToOne(() => TrialTable, (trial) => trial.copies, { onDelete: 'CASCADE' })
    @JoinColumn({ name: "uuid", referencedColumnName: "uuid" })
    trial: TrialTable;
}
