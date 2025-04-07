import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { VisitLog } from './visitlog.entity';

export const Department = {
  ELECTRICAL: 'electrical',
  IT: 'it',
} as const;

export const Gender = {
  MALE: 'male',
  FEMALE: 'female',
} as const;

@Entity('students_table')
export class Students {
  @PrimaryGeneratedColumn('uuid', { name: 'student_uuid' })
  studentUUID: "student_uuid" = 'student_uuid';

  //Unsure
  //@Column({ name:'department_uuid', type:'uuid', nullable:true })
  //departmentUUID:'department_uuid'='department_uuid';

  //student id format
  //instinstnumber/deptabbrserialno
  @Column({ name: 'student_id', type: 'varchar', length: 255, nullable: true })
  studentId: 'student_id' = 'student_id';
 
  @Column({
    name: 'email',
    type: 'varchar',
    length: 255,
    nullable: true,
    unique: true,
  })
  email: 'email' = 'email';

  //n
  @Column({ name: 'password', type: 'varchar', length: 255, nullable: true })
  password: 'password' = 'password';

  @Column({
    name: 'student_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  studentName: 'student_name' = 'student_name';

  //n
  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth: 'date_of_birth' = 'date_of_birth';

  @Column({ name: 'gender', type: 'varchar', nullable: true })
  gender: 'gender' = 'gender';

  @Column({ name: 'roll_no', type: 'int', nullable: true })
  rollNo: 'roll_no' = 'roll_no';

  @Column({ name: 'institute_name', type: 'varchar',length:255, nullable: true })
  instituteName: 'institute_name' = 'institute_name';

  @Column({
    name: 'phone_no',
    type: 'varchar',
    nullable: true,
  })
  phoneNo: 'phone_no' = 'phone_no';

  //n
  @Column({ name: 'address', type: 'text', nullable: true })
  address: 'address' = 'address';

  @Column({
    name: 'department',
    //type: 'enum'
    //enum: Department,
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  department: 'department' = 'department';

  @Column({ name: 'institute_uuid', type: 'uuid', nullable: true })
  instituteUUID: 'institute_uuid' = 'institute_uuid';

  @Column({
    name: 'year_of_admission',
    type: 'char',
    length: 4,
    nullable: true,
  })
  yearOfAdmission: 'year_of_admission' = 'year_of_admission';

  @Column({
    name: 'is_archived',
    type: 'boolean',
    nullable: true,
    default: false,
  })
  isArchived: 'is_archived' = 'is_archived';

  @Column({ name:'image_field', type:'varchar', nullable:true })
  imageField:'image_field'='image_field';


  @CreateDateColumn({ name: "created_at",  type:'date'})
  createdAt: "created_at" = "created_at";

  @UpdateDateColumn({ name: "updated_at"})
  updatedAt: "updated_at" = "updated_at";


    // @ManyToOne(() => VisitLog, (visitlog) => visitlog.student_UUID)
    // @JoinColumn({ name:"visitlog_student_id" })
    // student_UUID:'student_uuid' = 'student_uuid';

  //  @OneToMany(() => VisitLog, (visit_log) => visit_log.student_UUID)
  //   visitlog: 'visit_log' = 'visit_log';
}

export const studentObj = {
  email: 'email',
  password: 'password',
  student_name: 'student_name',
  date_of_birth: 'date_of_birth',
  gender: 'gender',
  roll_no: 'roll_no',
  institute_name: 'institute_name',
  phone_no: 'phone_no',
  address: 'address',
  department: 'department',
  institute_uuid: 'institute_uuid',
  year_of_admission: 'year_of_admission',
  image_field: 'image_field',
} as const;

export const student = new Students();

//Type that represents the table Columns
export type TStudents = {
  [P in keyof typeof student as typeof student[P]]: any;
}