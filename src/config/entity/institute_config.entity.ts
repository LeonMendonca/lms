import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { LibraryConfig } from "./library_config.entity";

@Entity('institute_config')
export class InstituteConfig {
    @PrimaryGeneratedColumn('uuid', { name: 'institute_uuid' })
    instituteUUID: "institute_uuid" = "institute_uuid";

    @Column({ name: 'institute_id', type: 'varchar', length: 255, unique:true })
    instituteId: "institute_id" = "institute_id"
    
    @Column({ name: 'institute_name', type: 'varchar',  length: 255 })
    instituteName: "institute_name" = "institute_name"
    
    @Column({name:'institute_abbr', type:'varchar', length:255, unique:true, nullable:true})
    instituteAbbr: "institute_abbr" = "institute_abbr"
    
    @Column({name:'institute_contact_person', type:'varchar', length:255,  nullable:true})
    instituteContactPerson: "institute_contact_person" = "institute_contact_person"
    
    @Column({name:'landline', type:'varchar', length:255,  nullable:true})
    landline: "landline" = "landline"

    @Column({ name: 'institute_email', type: 'varchar', length: 255, nullable:true })
    instituteEmail: "institute_email" = "institute_email"

    @Column({ name: 'mobile', type: 'varchar', length: 255,nullable:true })
    mobile: "mobile" = "mobile"

    @Column({name:'institute_address', type:'varchar', length:255, nullable:true})
    instituteAddress: "institute_address" = "institute_address"

    @Column({name:'pincode', type:'varchar', length:255,  nullable:true})
    pincode: "pincode" = "pincode"

    @Column({name:'state', type:'varchar', length:255,  nullable:true})
    state: "state" = "state"

    @Column({name:'city', type:'varchar', length:255,  nullable:true})
    city: "city" = "city"

    @Column({name:'website_url', type:'varchar', length:255,  nullable:true})
    websiteUrl: "website_url" = "website_url"

    @Column({ name: 'author', type: 'varchar', length: 255,  nullable:true })
    author: "author" = "author"

    @Column({ name: 'created_date', type: 'date', default: () => 'CURRENT_DATE' })
    createdDate: "created_date" = "created_date"

    @Column({ name: 'institute_logo', type: 'varchar', length: 255, nullable:true })
    instituteLogo: "institute_logo" = "institute_logo"

    @Column({ name: 'institute_header', type: 'varchar', length: 255, nullable:true })
    instituteHeader: "institute_header" = "institute_header"

    @Column({ name: "is_archived", type: 'boolean', default: false })
    isArchived: "is_archived" = "is_archived"


    // one institute can have one rule

}

const institute_config = new InstituteConfig()

export type TInstituteConfig = {
    [P in keyof typeof institute_config as typeof institute_config[P]]: any
}