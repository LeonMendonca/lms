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

  @Column({ name: 'lastName', type: 'varchar' })
  lastName: string;

  @Column({ name: 'courseName', type: 'varchar' })
  courseName: string;

  @Column({ name: 'mobileNumber', type: 'varchar' })
  mobileNumber: string;

  @Column({ name: 'email', type: 'varchar' })
  email: string;

  @Column({ name: 'dateOfBirth', type: 'date' })
  dateOfBirth: string;

  @Column({ name: 'bloodGroup', type: 'varchar' })
  bloodGroup: string;

  @Column({ name: 'gender', type: 'varchar' })
  gender: string;

  @Column({ name: 'address', type: 'varchar' })
  address: string;

  @Column({ name: 'secPhoneNumber', type: 'varchar' })
  secPhoneNumber: string;

  @Column({ name: 'terPhoneNumber', type: 'varchar' })
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
    length: 255,
  })
  instituteName: string;

  @Column({
    name: 'department',
    type: 'varchar',
    length: 255,
  })
  department: string;

  @Column({ name: 'instituteUuid', type: 'uuid' })
  instituteUuid: string;

  @Column({
    name: 'yearOfAdmission',
    type: 'varchar',
    nullable: true,
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
