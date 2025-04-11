import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('students_info')
export class StudentsData {
  @PrimaryGeneratedColumn('uuid', { name: 'studentUuid' })
  studentUuid: string;

  @Column({ name: 'barCode', type: 'varchar', nullable: true })
  barCode: string;

  @Column({ name: 'firstName', type: 'varchar' })
  firstName: string;

  @Column({ name: 'middleName', type: 'varchar', nullable: true })
  middleName: string;

  @Column({ name: 'lastName', type: 'varchar', nullable: true })
  lastName: string;

  @Column({ name: 'courseName', type: 'varchar', nullable: true })
  courseName: string;

  @Column({ name: 'mobileNumber', type: 'varchar', nullable: true })
  mobileNumber: string;

  @Column({ name: 'email', type: 'varchar', nullable: true })
  email: string;

  @Column({ name: 'dateOfBirth', type: 'date', nullable: true })
  dateOfBirth: string;

  @Column({ name: 'bloodGroup', type: 'varchar', nullable: true })
  bloodGroup: string;

  @Column({ name: 'gender', type: 'varchar', nullable: true })
  gender: string;

  @Column({ name: 'address', type: 'varchar', nullable: true })
  address: string;

  @Column({ name: 'secPhoneNumber', type: 'varchar', nullable: true })
  secPhoneNumber: string;

  @Column({ name: 'terPhoneNumber', type: 'varchar', nullable: true })
  terPhoneNumber: string;

  @Column({ name: 'password', type: 'varchar', length: 255, nullable: true })
  password: string;

  @Column({ name: 'rollNo', type: 'varchar', nullable: true })
  rollNo: string;
  
  @Column({ name: 'role', type: 'varchar', default: 'student' })
  role: string;

  @Column({
    name: 'instituteName',
    type: 'varchar',
    length: 255,nullable: true
  })
  instituteName: string;

  @Column({
    name: 'department',
    type: 'varchar',
    length: 255, nullable: true
  })
  department: string;

  @Column({ name: 'instituteUuid', type: 'uuid' })
  instituteUuid: string;

  @Column({
    name: 'yearOfAdmission',
    type: 'varchar',
    nullable: true
  })
  yearOfAdmission: string;

  @Column({
    name: 'isArchived',
    type: 'boolean',
    default: false,
  })
  isArchived: boolean;

  @Column({ name: 'profileImage', type: 'varchar', nullable: true })
  profileImage: string;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}

export const defaultStudentData = {
  firstName: 'firstName',
  middleName: 'middleName',
  lastName: 'lastName',
  courseName: 'courseName',
  mobileNumber: 'mobileNumber',
  email: 'email',
  dateOfBirth: 'dateOfBirth', // Should be in YYYY-MM-DD format if sent
  bloodGroup: 'bloodGroup',
  gender: 'gender',
  address: 'address',
  secPhoneNumber: 'secPhoneNumber',
  terPhoneNumber: 'terPhoneNumber',
  password: 'password',
  rollNo: 'rollNo',
  role: 'role',
  instituteName: 'instituteName',
  department: 'department',
  instituteUuid: 'instituteUuid',
  yearOfAdmission: 'yearOfAdmission'
};