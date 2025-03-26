import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { JournalTitle } from "./journals_title.entity";

@Entity('journal_copy')
export class JournalCopy {
    @PrimaryGeneratedColumn('uuid', { name: 'journal_copy_uuid' })
    journalCopyUUID: "journal_copy_uuid" = "journal_copy_uuid";

    @Column({ name: 'journal_copy_id', type: 'varchar', length: 255, unique: true, nullable: true })
    journalCopyId: 'journal_copy_id' = 'journal_copy_id';

    @Column({ name: 'barcode', type: 'varchar', length: 255 })
    barcode: "barcode" = "barcode";

    @Column({ name: 'item_type', type: 'varchar', length: 255 })
    itemType: "item_type" = "item_type";


    // added

    // @Column({ name: 'frequency', type: 'varchar', length: 255 })
    // frequency: "frequency" = "frequency"

    @Column({ name: 'issn', type: 'varchar', length: 255 })
    issn: 'issn' = 'issn';

    @Column({ name: 'journal_title', type: 'varchar', length: 255 })
    journalTitle: 'journal_title' = 'journal_title';

    @Column({ name: 'editor_name', type: 'varchar', length: 255 })
    editorName: 'editor_name' = 'editor_name';

    // --added

    @Column({ name: 'institute_uuid', type: 'uuid', nullable: true })
    instituteUUID: "institute_uuid" = "institute_uuid";

    @Column({ name: 'is_archived', default: false, type: 'boolean', nullable: true })
    isArchived: "is_archived" = "is_archived";

    @UpdateDateColumn({ name: 'time', type: "timestamp", default: () => 'CURRENT_TIMESTAMP' })
    createdAt: "time" = "time";

    @Column({ name: 'created_by', type: 'uuid', nullable: true })
    createdBy: "created_by" = "created_by";

    @Column({ name: 'remarks', type: 'simple-array', nullable: true })
    remarks: "remarks" = "remarks";

    @Column({ name: 'copy_images', type: 'simple-array', nullable: true })
    copyImages: "copy_images" = "copy_images";

    @Column({ name: 'copy_additional_fields', type: 'json', nullable: true })
    copyAdditionalFields: "copy_additional_fields" = "copy_additional_fields";

    @Column({ name: 'copy_description', type: 'text', nullable: true })
    copyDescription: "copy_description" = "copy_description";

    @Column({ name: 'is_available', type: 'boolean', nullable: true, default: true })
    isAvailable: "is_available" = "is_available";

    @ManyToOne(() => JournalTitle, (journalTitle) => journalTitle.journalCopies)
    @JoinColumn({ name: "journal_title_uuid" })
    journalTitleUUID: "journal_title_uuid" = "journal_title_uuid";
}

const journal_copy = new JournalCopy();

//Type that represents the table Columns
export type TJournalCopy = {
    [P in keyof typeof journal_copy as typeof journal_copy[P]]: any;
}