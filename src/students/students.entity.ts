import { Entity, Column, PrimaryGeneratedColumn, Check } from 'typeorm';

export const Department = {
  ELECTRICAL: 'electrical',
  IT: 'it',
} as const;

export const Gender = {
  MALE: 'male',
  FEMALE: 'female',
} as const;

@Entity('students_table')
//@Check(`"email" ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+.[A-Za-z]{2,}$'`)
export class Students {
  @PrimaryGeneratedColumn('uuid', { name: 'student_uuid' })
  studentUUID: "student_uuid";

  @Column({ name: 'student_id', type: 'varchar', length: 255, nullable: true })
  studentId: "student_id";

  @Column({ name: 'count', type: 'int', nullable: true })
  count: "count";

  @Column({
    name: 'email',
    type: 'varchar',
    length: 255,
    nullable: true,
    unique: true,
  })
  email: "email";

  @Column({ name: 'password', type: 'varchar', length: 255, nullable: true })
  password: "password";

  @Column({
    name: 'student_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  studentName: "student_name";

  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth: "date_of_birth";

  @Column({ name: 'gender', type: 'enum', enum: Gender, nullable: true })
  gender: "gender";

  @Column({ name: 'roll_no', type: 'int', nullable: true })
  rollNo: "roll_no";

  @Column({ name: 'institute_name', type: 'varchar', nullable: true })
  instituteName: "institute_name";

  @Column({
    name: 'phone_no',
    type: 'char',
    length: 10,
    nullable: true,
    unique: true,
  })
  phoneNo: "phone_no";

  @Column({ name: 'address', type: 'text', nullable: true })
  address: "address";

  @Column({
    name: 'department',
    //type: 'enum'
    //enum: Department,
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  department: "department";

  @Column({ name: 'institute_id', type: 'uuid', nullable: true })
  instituteId: "institute_id";

  @Column({
    name: 'year_of_admission',
    type: 'char',
    length: 4,
    nullable: true,
  })
  yearOfAdmission: "year_of_admission";

  @Column({
    name: 'is_archived',
    type: 'boolean',
    nullable: true,
    default: false,
  })
  isArchived: "is_archived";
}
