import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { TrialCopy } from './trial_copy.entity'

@Entity('trial_table')
export class TrialTable {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'uuid', unique: true, generated: 'uuid' })
    uuid: string;

    @Column({ type: 'varchar', length: 255 })
    journal_name: string;

    @Column({ type: 'int' })
    total_count: number;

    @Column({ type: 'int' })
    available_count: number;

    @OneToMany(() => TrialCopy, (trialCopy) => trialCopy.trial)
    copies: TrialCopy[];
}
