import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
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

  @Column({ name: 'student_id', type: 'varchar', length: 255, nullable: true })
  studentId: 'student_id' = 'student_id';
  // relation 
 
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

  @Column({ name: 'gender', type: 'enum', enum: Gender, nullable: true })
  gender: 'gender' = 'gender';

  @Column({ name: 'roll_no', type: 'int', nullable: true })
  rollNo: 'roll_no' = 'roll_no';

  @Column({ name: 'institute_name', type: 'varchar', nullable: true })
  instituteName: 'institute_name' = 'institute_name';

  @Column({
    name: 'phone_no',
    type: 'char',
    length: 10,
    nullable: true,
  })
  phoneNo: 'phone_no' = 'phone_no';

  //n
  @Column({ name: 'address', type: 'text', nullable: true })
  address: 'address' = 'address';

  //instinstnumber/deptabbrserialno

  //dept uuid
  //new column

  @Column({
    name: 'department',
    //type: 'enum'
    //enum: Department,
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  department: 'department' = 'department';

  @Column({ name: 'institute_id', type: 'uuid', nullable: true })
  instituteId: 'institute_id' = 'institute_id';

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

  @CreateDateColumn({ name: "created_at" })
  createdAt: "created_at" = "created_at";

  @UpdateDateColumn({ name: "updated_at"})
  updatedAt: "updated_at" = "updated_at";

  //  @OneToMany(() => VisitLog, (visit_log) => visit_log.student_UUID)
  //   visitlog: 'visit_log' = 'visit_log';
}

export const student = new Students();

//Type that represents the table Columns
export type TStudents = {
  [P in keyof typeof student as typeof student[P]]: typeof student[P];
}