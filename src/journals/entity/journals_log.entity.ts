// @ts-nocheck

import { Students } from "src/students/students.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { JournalTitle } from "./journals_title.entity";
import { JournalCopy } from "./journals_copy.entity";
import { FeesPenalties } from "src/fees-penalties/entity/fees-penalties.entity";

@Entity('journal_logs')
export class JournalLogs {
    @PrimaryGeneratedColumn('uuid', { name: "journal_log_uuid" })
    journalLogUuid: "journal_log_uuid" = "journal_log_uuid"

    @ManyToOne(() => Students, (students) => students.studentUUID)
    @JoinColumn({ name: "borrower_uuid" })
    borrowerUUID: 'borrower_uuid' = 'borrower_uuid';

    @ManyToOne(() => JournalTitle, (book_title) => book_title.journalUUID)
    @JoinColumn({ name: "journal_title_uuid" })
    journalUUID: 'journal_title_uuid' = 'journal_title_uuid';

    @ManyToOne(() => JournalCopy, (journal_copy) => journal_copy.journalCopyUUID)
    @JoinColumn({ name: 'journal_copy_uuid' })
    journalCopyUUID: 'journal_copy_uuid' = 'journal_copy_uuid';

    @Column({ name: 'old_journal_copy', type: 'jsonb' })
    oldJournalCopy: 'old_journal_copy' = "old_journal_copy";

    @Column({ name: 'new_journal_copy', type: 'jsonb' })
    newJournalCopy: 'new_journal_copy' = "new_journal_copy";

    @Column({ name: 'old_journal_title', type: 'jsonb' })
    oldJournalTitle: 'old_journal_copy' = "old_journal_copy";

    @Column({ name: 'new_journal_title', type: 'jsonb' })
    newJournalTitle: 'old_journal_copy' = "old_journal_copy";

    @Column({ name: 'action', type: 'varchar', length: 255 })
    action: "action" = 'action';

    @Column({ name: 'description', type: 'varchar', length: 255 })
    description: 'description' = 'description';

    @Column({ name: 'issn', type: 'varchar', length: 255 })
    issn: 'issn' = 'issn';

    @Column({ name: 'time', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: 'time' = 'time';

    @Column({ name: 'ip_address', type: 'varchar', length: 255, nullable: true })
    ipAddress: 'ip_address' = 'ip_address';

    @ManyToOne(() => FeesPenalties, (fees_penalties) => fees_penalties.fpUUID)
    @JoinColumn({ name: 'fp_uuid' })
    fpUUID: 'fp_uuid' = 'fp_uuid';
}

export const journallog = new JournalLogs()

export type TJournalLogs = {
    [P in keyof typeof journallog]: any;
};