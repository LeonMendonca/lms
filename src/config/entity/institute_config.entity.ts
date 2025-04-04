import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { LibraryConfig } from "./library_config.entity";

@Entity('institute_config')
export class InstituteConfig {
    @PrimaryGeneratedColumn('uuid', { name: 'institute_uuid' })
    instituteUUID: "institute_uuid" = "institute_uuid";

    @Column({ name: 'institute_id', type: 'varchar', length: 255, unique:true })
    instituteId: "institute_id" = "institute_id"
    
    @Column({ name: 'institute_name', type: 'varchar', length: 255 })
    instituteName: "institute_name" = "institute_name"
    
    @Column({name:'institute_abbr', type:'varchar', length:255})
    instituteAbbr: "institute_abbr" = "institute_abbr"
    
    @Column({name:'institute_contact_person', type:'varchar', length:255, nullable:true})
    instituteContactPerson: "institute_contact_person" = "institute_contact_person"
    
    @Column({name:'landline', type:'varchar', length:255, nullable:true})
    landline: "landline" = "landline"

    @Column({ name: 'institute_email', type: 'varchar', length: 255 })
    instituteEmail: "institute_email" = "institute_email"

    @Column({ name: 'mobile', type: 'varchar', length: 255 })
    mobile: "mobile" = "mobile"

    @Column({name:'institute_address', type:'varchar', length:255})
    instituteAddress: "institute_address" = "institute_address"

    @Column({name:'pincode', type:'varchar', length:255})
    pincode: "pincode" = "pincode"

    @Column({name:'state', type:'varchar', length:255})
    state: "state" = "state"

    @Column({name:'city', type:'varchar', length:255})
    city: "city" = "city"

    @Column({name:'website_url', type:'varchar', length:255})
    websiteUrl: "website_url" = "website_url"

    @Column({ name: 'author', type: 'varchar', length: 255 })
    author: "author" = "author"

    @Column({ name: 'created_date', type: 'date', default: () => 'CURRENT_DATE' })
    createdDate: "created_date" = "created_date"

    @Column({ name: 'institute_logo', type: 'varchar', length: 255 })
    instituteLogo: "institute_logo" = "institute_logo"

    @Column({ name: 'institute_header', type: 'varchar', length: 255 })
    instituteHeader: "institute_header" = "institute_header"

    @Column({ name: "is_archived", type: 'boolean', default: false })
    isArchived: "is_archived" = "is_archived"

}

const institute_config = new InstituteConfig()

export type TInstituteConfig = {
    [P in keyof typeof institute_config as typeof institute_config[P]]: any
}