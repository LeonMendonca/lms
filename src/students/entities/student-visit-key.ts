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

  
  @Column({
    name: 'createdAt',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({ name: 'longitude', type: 'double precision' })
  longitude: number;
  
  @Column({ name: 'latitude', type: 'double precision' })
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
