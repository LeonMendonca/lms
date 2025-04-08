import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn } from "typeorm";
import { InstituteConfig } from "./institute_config.entity";

const ROLE = {
    STUDENT : "student",
    STAFF : "staff"
} as const

@Entity('library_config')
export class LibraryConfig {
    @PrimaryColumn({ name: 'library_rule_id', type: 'varchar', length: 255 })
    libraryRuleId: "library_rule_id" = "library_rule_id"

    @Column({ name: 'max_books_student', type: 'int' })
    maxBooksStudent: "max_books_student" = "max_books_student"

    @Column({ name: 'max_books_staff', type: 'int' })
    maxBooksStaff: "max_books_staff" = "max_books_staff"

    @Column({ name: 'max_days', type: 'int'})
    maxDays: "max_days" = "max_days"

    @Column({ name: 'late_fees_per_day', type: 'int' })
    lateFeesPerDay: "late_fees_per_day" = "late_fees_per_day"

    @Column({ name: 'operating_hours', type: 'jsonb' })
    operatingHours: "operating_hours" = "operating_hours"

    @Column({ name: 'created_at', type: 'date', default: () => 'CURRENT_DATE' })
    createdAt: "created_at" = "created_at"

    @Column({ name: 'created_by_uuid', type: 'uuid', nullable:true })
    createdByUUID: "created_by_uuid" = "created_by_uuid"

    @Column({ name: "is_archived", type: 'boolean', default: false })
    isArchived: "is_archived" = "is_archived"

    @Column({name:'email_notifications', type: 'jsonb'})
    emailNotifications: "email_notifications" = "email_notifications"

    // one rule belongs to one institute
    @ManyToOne(() => InstituteConfig, (institute) => institute.instituteUUID)
    @JoinColumn({ name: "institute_uuid" })
    instituteUUID: 'institute_uuid' = 'institute_uuid';
}

const library_config = new LibraryConfig()

export type TLibraryConfig = {
    [P in keyof typeof library_config as typeof library_config[P]]: any
}