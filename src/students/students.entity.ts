import { Entity, Column, PrimaryGeneratedColumn, Check } from 'typeorm';

export enum Department {
  ELECTRICAL = 'electrical',
  IT = 'it',
}

@Entity('students_table')
//@Check(`"email" ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+.[A-Za-z]{2,}$'`)
export class Students {
  @PrimaryGeneratedColumn('uuid', { name: 'student_id' })
  studentId: number;

  @Column({
    name: 'email',
    type: 'varchar',
    length: 255,
    nullable: true,
    unique: true,
  })
  email: string;

  @Column({ name: 'full_name', type: 'varchar', length: 255, nullable: true })
  fullName: string;

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
    type: 'enum',
    enum: Department,
    nullable: true,
  })
  department: string;

  @Column({ name: 'institute_id', type: 'uuid', nullable: true })
  instituteId: string;
}
