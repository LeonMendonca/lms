import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Generated } from 'typeorm';
import { TrialCopy } from './trial_copy.entity'
import { boolean } from 'zod';

@Entity('trial_table')
export class TrialTable {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'uuid', unique: true, generated: 'uuid' })
    // @Generated('uuid')
    uuid: string;

    @Column({ type: 'varchar', length: 255 })
    journal_name: string;

    @Column({ type: 'int' })
    total_count: number;

    @Column({ type: 'int' })
    available_count: number;

    @Column({ type: 'boolean' })
    is_archived: boolean;

    @OneToMany(() => TrialCopy, (trialCopy) => trialCopy.trial)
    copies: TrialCopy[];
}
