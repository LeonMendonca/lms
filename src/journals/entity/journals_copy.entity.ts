import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { JournalTitle } from "./journals_title.entity";

@Entity('journal_copy')
export class JournalCopy {
    @PrimaryGeneratedColumn('uuid', { name: 'journal_copy_uuid' })
    journalCopyUUID: "journal_copy_uuid" = "journal_copy_uuid";

    @Column({
        name: 'journal_copy_id',
        type: 'varchar',
        length: 255,
        unique: true,
        nullable: true,
    })
    journalCopyId: 'journal_copy_id' = 'journal_copy_id';

    @Column({ name: 'source_of_acquisition', type: 'varchar', length: 255 })
    sourceOfAcquisition: "source_of_acquisition" = "source_of_acquisition";

    @Column({ name: 'date_of_acquisition', type: 'date' })
    dateOfAcquisition: "date_of_acquisition" = "date_of_acquisition";

    @Column({ name: 'bill_no', type: 'varchar' })
    billNo: "bill_no" = "bill_no";

    @Column({ name: 'language', type: 'varchar', length: 255 })
    language: "language" = "language";

    @Column({ name: 'inventory_number', type: 'varchar', nullable: true })
    inventoryNumber: "inventory_number" = "inventory_number";

    @Column({ name: 'accession_number', type: 'varchar' })
    accessionNumber: "accession_number" = "accession_number";

    @Column({ name: 'barcode', type: 'varchar', length: 255 })
    barcode: "barcode" = "barcode";

    @Column({ name: 'item_type', type: 'varchar', length: 255 })
    itemType: "item_type" = "item_type";

    @Column({ name: 'institute_uuid', type: 'uuid', nullable: true })
    instituteUUID: "institute_uuid" = "institute_uuid";

    @Column({
        name: 'is_archived',
        default: false,
        type: 'boolean',
        nullable: true,
    })
    isArchived: "is_archived" = "is_archived";

    @CreateDateColumn({ name: 'created_at' })
    createdAt: "created_at" = "created_at";

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: "updated_at" = "updated_at";

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