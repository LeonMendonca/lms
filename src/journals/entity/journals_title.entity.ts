import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { JournalCopy } from "./journals_copy.entity";


export const CATEGORY = {
    JOURNAL: "journal",
    MAGAZINE: "magazine"
} as const

@Entity('journal_titles')
export class JournalTitle {
    @PrimaryGeneratedColumn('uuid', { name: 'journal_uuid' })
    journalUUID: 'journal_uuid' = 'journal_uuid';

    @Column({ name: 'journal_title_id', type: 'varchar', length: 255, unique: true, nullable: true })
    journalTitleId: 'journal_title_id' = 'journal_title_id';

    @Column({ name: 'category', type: 'enum', enum: CATEGORY })
    category: "category" = "category";

    @Column({ name: 'name_of_publisher', type: 'varchar', length: 255 })
    nameOfPublisher: 'name_of_publisher' = 'name_of_publisher';

    @Column({ name: 'place_of_publication', type: 'varchar', length: 255 })
    placeOfPublication: 'place_of_publication' = 'place_of_publication';

    @Column({ name: 'subscription_id', type: 'varchar', length: 255, unique: true })
    subscriptionId: 'subscription_id' = 'subscription_id';

    @Column({ name: 'subscription_start_date', type: 'date' })
    subscriptionStartDate: 'subscription_start_date' = 'subscription_start_date';

    @Column({ name: 'subscription_end_date', type: 'date' })
    subscriptionEndDate: 'subscription_end_date' = 'subscription_end_date';

    @Column({ name: "volume_no", type: "varchar", length: 255 })
    volumeNumber: "volume_no" = "volume_no"

    @Column({ name: 'frequency', type: 'varchar', length: 255 })
    frequency: "frequency" = "frequency"

    @Column({ name: 'issue_number', type: 'varchar', length: 255 })
    issueNumber: "issue_number" = "issue_number"

    @Column({ name: 'vendor_name', type: 'varchar', length: 255 })
    vendorName: 'vendor_name' = "vendor_name"

    @Column({ name: 'subscription_price', type: 'int' })
    subscriptionPrice: "subscription_price" = "subscription_price"

    @Column({ name: 'library_name', type: 'varchar', length: 255 })
    libraryName: "library_name" = "library_name"

    @Column({ name: 'classification_number', type: 'varchar', length: 255, nullable: true })
    classificationNumber: 'classification_number' = 'classification_number';

    @Column({ name: 'is_archived', default: false, type: 'boolean', nullable: true })
    isArchived: 'is_archived' = 'is_archived';

    @Column({ name: 'total_count', type: 'int', nullable: true, default: 1 })
    totalCount: 'total_count' = 'total_count';

    @Column({ name: 'available_count', type: 'int', nullable: true, default: 1 })
    availableCount: 'available_count' = 'available_count';

    @CreateDateColumn({ name: 'created_at', type: "date", default: () => 'CURRENT_TIMESTAMP' })
    createdAt: 'created_at' = 'created_at';

    @UpdateDateColumn({ name: 'updated_at', type: "date", default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: 'updated_at' = 'updated_at';

    @Column({ name: 'title_images', type: 'simple-array', nullable: true })
    titleImages: 'title_images' = 'title_images';

    @Column({ name: 'title_additional_fields', type: 'json', nullable: true })
    titleAdditionalFields: 'title_additional_fields' = 'title_additional_fields';

    @Column({ name: 'title_description', type: 'text', nullable: true })
    titleDescription: 'title_description' = 'title_description';

    @Column({ name: 'institute_uuid', type: 'uuid', nullable: true })
    instituteUUID: "institute_uuid" = "institute_uuid";

    //Relationships
    @OneToMany(() => JournalCopy, (journalcopy) => journalcopy.journalTitleUUID)
    journalCopies: 'journal_copies' = 'journal_copies';


}

const journal_title = new JournalTitle();

//Type that represents the table Columns
export type TJournalTitle = {
    [P in keyof typeof journal_title as typeof journal_title[P]]: any;
}

