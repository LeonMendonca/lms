import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { JournalCopy } from "./journals_copy.entity";

@Entity('journal_titles')
export class JournalTitle {
    @PrimaryGeneratedColumn('uuid', { name: 'journal_uuid' })
    journalUUID: 'journal_uuid' = 'journal_uuid';

    @Column({
        name: 'journal_title_id',
        type: 'varchar',
        length: 255,
        unique: true,
        nullable: true,
    })
    journalTitleId: 'journal_title_id' = 'journal_title_id';

    @Column({ name: 'journal_title', type: 'varchar', length: 255 })
    journalTitle: 'journal_title' = 'journal_title';

    @Column({ name: 'journal_author', type: 'varchar', length: 255 })
    journalAuthor: 'journal_author' = 'journal_author';

    @Column({ name: 'name_of_publisher', type: 'varchar', length: 255 })
    nameOfPublisher: 'name_of_publisher' = 'name_of_publisher';

    @Column({ name: 'place_of_publication', type: 'varchar', length: 255 })
    placeOfPublication: 'place_of_publication' = 'place_of_publication';

    @Column({ name: 'year_of_publication', type: 'date' })
    yearOfPublication: 'year_of_publication' = 'year_of_publication';

    @Column({ name: 'edition', type: 'varchar', length: 255 })
    edition: 'edition' = 'edition';

    @Column({ name: 'issn', type: 'varchar', length: 255 })
    issn: 'issn' = 'issn';

    @Column({ name: 'no_of_pages', type: 'integer', nullable: true })
    noPages: 'no_of_pages' = 'no_of_pages';

    @Column({ name: 'no_of_preliminary', type: 'integer', nullable: true })
    noPreliminary: 'no_of_preliminary' = 'no_of_preliminary';

    @Column({ name: 'subject', type: 'varchar', length: 255 })
    subject: 'subject' = 'subject';

    @Column({ name: 'department', type: 'varchar', length: 255 })
    department: 'department' = 'department';

    @Column({ name: 'call_number', type: 'varchar', length: 255, nullable: true })
    callNumber: 'call_number' = 'call_number';

    @Column({ name: 'author_mark', type: 'varchar', length: 255 })
    authorMark: 'author_mark' = 'author_mark';

    @Column({
        name: 'is_archived',
        default: false,
        type: 'boolean',
        nullable: true,
    })
    isArchived: 'is_archived' = 'is_archived';

    @Column({ name: 'total_count', type: 'int', nullable: true, default: 1 })
    totalCount: 'total_count' = 'total_count';

    @Column({ name: 'available_count', type: 'int', nullable: true, default: 1 })
    availableCount: 'available_count' = 'available_count';

    @CreateDateColumn({ name: 'created_at' })
    createdAt: 'created_at' = 'created_at';

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: 'updated_at' = 'updated_at';

    @Column({ name: 'title_images', type: 'simple-array', nullable: true })
    titleImages: 'title_images' = 'title_images';

    @Column({ name: 'title_additional_fields', type: 'json', nullable: true })
    titleAdditionalFields: 'title_additional_fields' = 'title_additional_fields';

    @Column({ name: 'title_description', type: 'text', nullable: true })
    titleDescription: 'title_description' = 'title_description';

    //Relationships
    @OneToMany(() => JournalCopy, (journalcopy) => journalcopy.journalTitleUUID)
    journalCopies: 'journal_copies' = 'journal_copies';
}

const journal_title = new JournalTitle();

//Type that represents the table Columns
export type TJournalTitle = {
    [P in keyof typeof journal_title as typeof journal_title[P]]: any;
}