import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { LibraryConfig } from "./library_config.entity";

@Entity('institute_config')
export class InstituteConfig {
    @PrimaryColumn({ name: 'institute_id', type: 'varchar', length: 255 })
    instituteId: "institute_id" = "institute_id"

    @Column({ name: 'institute_name', type: 'varchar', length: 255 })
    instituteName: "institute_name" = "institute_name"

    @Column({ name: 'institute_email', type: 'varchar', length: 255 })
    instituteEmail: "institute_email" = "institute_email"

    @Column({ name: 'institute_phone_number', type: 'varchar', length: 255 })
    institutePhoneNumber: "institute_phone_number" = "institute_phone_number"

    @Column({ name: 'author', type: 'varchar', length: 255 })
    author: "author" = "author"

    @Column({ name: 'created_date', type: 'date', default: () => 'CURRENT_DATE' })
    createdDate: "created_date" = "created_date"

    @Column({ name: 'institute_logo', type: 'varchar', length: 255 })
    instituteLogo: "institute_logo" = "institute_logo"

    @Column({ name: "is_archived", type: 'boolean', default: false })
    isArchived: "is_archived" = "is_archived"

    @ManyToOne(() => LibraryConfig, (rule) => rule.libraryRuleId)
    @JoinColumn({ name: 'library_rule_id' })
    libraryRuleId: 'library_rule_id' = 'library_rule_id';


}

const institute_config = new InstituteConfig()

export type TInstituteConfig = {
    [P in keyof typeof institute_config as typeof institute_config[P]]: any
}