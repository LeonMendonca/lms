import { BeforeInsert, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { JournalsCopy } from "./journals_copy.entity";

@Entity('journals_table')
export class JournalsTable {

    @PrimaryGeneratedColumn('uuid', { name: 'journal_uuid' })
    journalUUID: "journal_uuid" = "journal_uuid";

    // // join added
    @OneToMany(() => JournalsCopy, (copy) => copy.journal, { onDelete: "CASCADE" })
    journal_uuid: JournalsCopy[]

    // General Information

    @Column({ name: "name_of_journal", type: "varchar", length: 255 }) //given in frontend
    nameOfJournal: "name_of_journal" = "name_of_journal";

    @Column({ name: "name_of_publisher", type: "varchar", length: 255 }) //given in frontend
    nameOfPublisher: "name_of_publisher" = "name_of_publisher";

    @Column({ name: "place_of_publisher", type: "varchar", length: 255 }) //given in frontend
    placeOfPublisher: "place_of_publisher" = "place_of_publisher";

    @Column({ name: "editor_name", type: "varchar", length: 255 }) //given in frontend
    editorName: "editor_name" = "editor_name";

    @Column({ name: "year_of_publication", type: "date" }) //added on my own
    yearOfPublication: "year_of_publication" = "year_of_publication";

    @Column({ name: "language", type: "varchar", length: 255 }) // added on my own
    language: "language" = "language";
    // language: string;

    @Column({ name: "department", type: "varchar", length: 255 }) // added on my own
    department: "department" = "department"; // this should be a enum

    // Subscription Details

    @Column({ name: "subscription_price", type: "int" }) //given in frontend
    subscriptionPrice: "subscription_price" = "subscription_price";

    @Column({ name: "subscription_start_date", type: "date" }) //given in frontend
    subscriptionStartDate: "subscription_start_date" = "subscription_start_date";

    @Column({ name: "subscription_end_date", type: "date" }) //given in frontend
    subscriptionEndDate: "subscription_end_date" = "subscription_end_date";

    // Volume & Issue Details

    @Column({ name: "volume_number", type: "varchar", length: 255 }) //given in frontend
    volumeNumber: "volume_number" = "volume_number";

    @Column({ name: "issue_number", type: "varchar", length: 255 }) //given in frontend
    issueNumber: "issue_number" = "issue_number";

    @Column({ name: "is_archived", type: "boolean", default: false }) // added on my own
    isArchived: "is_archived" = "is_archived";

    @Column({ name: "total_count", type: "int" }) // added on my own
    totalCount: "total_count" = "total_count";

    @Column({ name: "available_count", type: "int" }) // added on my own
    availableCount: "available_count" = "available_count";

    // Publication & Classification

    @Column({ name: "frequency", type: "int" }) //given in frontend
    frequency: "frequency" = "frequency";

    @Column({ name: "item_type", type: "varchar", length: 255 }) //given in frontend
    itemType: "item_type" = "item_type";

    @Column({ name: "issn", type: "varchar", length: 255 }) //given in frontend
    issn: "issn" = "issn";

    @Column({ name: "call_number", type: "varchar", length: 255 }) //given in frontend
    callNumber: "call_number" = "call_number";

    @Column({ name: "created_at", type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createdAt: "created_at" = "created_at";

    @Column({ name: "updated_at", type: "date" }) // added on my own
    updatedAt: "updated_at" = "updated_at";

    // Acquisition & Library Management

    @Column({ name: "vendor_name", type: "varchar", length: 255 }) //given in frontend
    vendorName: "vendor_name" = "vendor_name";

    @Column({ name: "library_name", type: "varchar", length: 255 }) //given in frontend
    libraryName: "library_name" = "library_name";

    @Column({ name: "acquisition_date", type: "date" }) // added on my own
    acquisitionDate: "acquisition_date" = "acquisition_date";
}

