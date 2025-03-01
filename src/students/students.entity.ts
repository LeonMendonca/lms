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
  studentUUID: number;

  @Column({ name: 'student_id', type: 'varchar', length: 255, nullable: true })
  studentId: number;

  @Column({ name: 'count', type: 'int', nullable: true })
  count: number;

  @Column({
    name: 'email',
    type: 'varchar',
    length: 255,
    nullable: true,
    unique: true,
  })
  email: string;

  @Column({ name: 'password', type: 'varchar', length: 255, nullable: true })
  password: string;

  @Column({
    name: 'student_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  fullName: string;

  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ name: 'gender', type: 'enum', enum: Gender, nullable: true })
  gender: keyof typeof Gender | '';

  @Column({ name: 'roll_no', type: 'int', nullable: true })
  rollNo: number;

  @Column({ name: 'institute_name', type: 'varchar', nullable: true })
  institute_name: string;

  @Column({
    name: 'phone_no',
    type: 'char',
    length: 10,
    nullable: true,
    unique: true,
  })
  phoneNo: number;

  @Column({ name: 'address', type: 'text', nullable: true })
  address: string;

  @Column({
    name: 'department',
    //type: 'enum'
    //enum: Department,
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  department: string;

  @Column({ name: 'institute_id', type: 'uuid', nullable: true })
  instituteId: string;

  @Column({
    name: 'year_of_admission',
    type: 'char',
    length: 4,
    nullable: true,
  })
  yearOfAdmission: string;

  @Column({
    name: 'is_archived',
    type: 'boolean',
    nullable: true,
    default: false,
  })
  isArchived: boolean;
}
