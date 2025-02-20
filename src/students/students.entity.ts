import { Entity, Column, PrimaryGeneratedColumn, Check } from 'typeorm';

@Entity('students_table')
@Check(`"email" ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+.[A-Za-z]{2,}$'`)
export class Students {
  //default is increment strategy 1, 2, 3, ... so on
  @PrimaryGeneratedColumn('uuid', { name: 'student_id' })
  studentId: number;

  @Column({
    name: 'email',
    type: 'varchar',
    length: 255,
    nullable: false,
    unique: true,
  })
  email: string;

  @Column({ name: 'full_name', type: 'varchar', length: 255, nullable: false })
  fullName: string;

  @Column({
    name: 'phone_no',
    type: 'numeric',
    precision: 10,
    scale: 0,
    nullable: false,
    unique: true,
  })
  phoneNo: number;

  @Column({ name: 'address', type: 'text', nullable: false })
  address: string;
}
