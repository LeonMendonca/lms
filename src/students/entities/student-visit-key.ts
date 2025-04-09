import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('student_visit_key')
export class StudentsVisitKey {
  @PrimaryGeneratedColumn('uuid', { name: 'studentKeyUuid' })
  studentKeyUuid: string;

  @Column({ name: 'studentUuid', type: 'varchar', length: 255 })
  studentUuid: string;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @Column({ name: 'longitude' })
  longitude: number;

  @Column({ name: 'latitude' })
  latitude: number;

  @Column({ name: 'action', nullable: true })
  action: string;

  @Column({
    name: 'IsUsed',
    type: 'boolean',
    default: false,
  })
  isUsed: boolean;
}
