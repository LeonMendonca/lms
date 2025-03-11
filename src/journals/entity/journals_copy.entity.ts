import { Column, Entity, ManyToMany, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { JournalsTable } from "./journals_table.entity";


@Entity('journals_copy')
export class JournalsCopy {
    // written because the PrimaryGeneratedColumn was missing, i will have to write the code for uuid for joining them together
    // @PrimaryGeneratedColumn({ name: "serial_number", type: "int" })
    // serialNumber: "serial_number" = "serial_number";

    // need to create book_id manually, so create a function, this was below general info
    @PrimaryGeneratedColumn({ name: "journal_id" })
    journalID: "journal_id" = "journal_id";

    @Column({ name: "journal_uuid", type: "uuid" }) //added on my own
    journal_uuid: "journal_uuid" = "journal_uuid";

    // join added
    @ManyToOne(() => JournalsTable, (journal) => journal.journal_uuid, { onDelete: "CASCADE" })
    journal: JournalsTable;


    // General Information


    @Column({ name: "name_of_journal", type: "varchar", length: 255 }) //given in frontend
    nameOfJournal: "name_of_journal" = "name_of_journal";

    @Column({ name: "name_of_publisher", type: "varchar", length: 255 }) //given in frontend
    nameOfPublisher: "name_of_publisher" = "name_of_publisher";

    @Column({ name: "editor_name", type: "varchar", length: 255 }) //given in frontend
    editorName: "editor_name" = "editor_name";

    @Column({ name: "language", type: "varchar", length: 255 }) // added on my own
    language: "language" = "language";

    @Column({ name: "department", type: "varchar", length: 255 }) // added on my own
    department: "department" = "department";

    // Subscription Details

    // Volume & Issue Details

    @Column({ name: "volume_number", type: "int" }) //given in frontend
    volumeNumber: "volume_number" = "volume_number";

    @Column({ name: "issue_number", type: "int" }) //given in frontend
    issueNumber: "issue_number" = "issue_number";

    @Column({ name: "is_archived", type: "boolean", default: false }) // added on my own
    isArchived: "is_archived" = "is_archived";

    // Publication & Classification

    @Column({ name: "issn", type: "varchar", length: 255 }) //given in frontend
    issn: "issn" = "issn";

    // @Column({ name: "journal_uuid", type: "varchar", length: 255 }) //added on my own
    // journal_uuid: "journal_uuid" = "journal_uuid";

    @Column({ name: "call_number", type: "varchar", length: 255 }) //given in frontend
    callNumber: "call_number" = "call_number";

    @Column({ name: "created_at", type: "date" }) // added on my own
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