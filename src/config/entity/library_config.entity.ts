import { Column, Entity, JoinColumn, OneToMany, PrimaryColumn } from "typeorm";
import { InstituteConfig } from "./institute_config.entity";

@Entity('library_config')
export class LibraryConfig {
    @PrimaryColumn({ name: 'library_rule_id', type: 'varchar', length: 255 })
    libraryRuleId: "library_rule_id" = "library_rule_id"

    @Column({ name: 'max_books', type: 'int' })
    maxBooks: "max_books" = "max_books"

    @Column({ name: 'max_days', type: 'int' })
    maxDays: "max_days" = "max_days"

    @Column({ name: 'late_fees_per_day', type: 'int' })
    lateFeesPerDay: "late_fees_per_day" = "late_fees_per_day"

    @Column({ name: 'operating_hours', type: 'jsonb' })
    operatingHours: "operating_hours" = "operating_hours"

    @Column({ name: 'enable_email', type: 'boolean', default: false })
    enableEmail: "enable_email" = "enable_email"

    @Column({ name: 'created_at', type: 'date', default: () => 'CURRENT_DATE' })
    createdAt: "created_at" = "created_at"

    @Column({ name: 'created_by_uuid', type: 'uuid', nullable:true })
    createdByUUID: "created_by_uuid" = "created_by_uuid"

    @Column({ name: "is_archived", type: 'boolean', default: false })
    isArchived: "is_archived" = "is_archived"

    @Column({ name: 'institute_id', type: 'varchar', length: 255 })
    instituteId: "institute_id" = "institute_id"

}

const library_config = new LibraryConfig()

export type TLibraryConfig = {
    [P in keyof typeof library_config as typeof library_config[P]]: any
}