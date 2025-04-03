import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

export const Action = {
  ENTRY: 'entry',
  EXIT: 'exit',
} as const;

@Entity('student_visit_key')
export class StudentsVisitKey {
  @PrimaryGeneratedColumn('uuid', { name: 'student_key_uuid' })
  studentKeyUUID: 'student_key_uuid' = 'student_key_uuid';

  @Column({ name: 'student_id', type: 'varchar', length: 255, nullable: true })
  studentId: 'student_id' = 'student_id';

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: 'created_at' = 'created_at';

  @Column({ name: 'longitude' })
  longitude: 'longitude' = 'longitude';

  @Column({ name: 'latitude' })
  latitude: 'latitude' = 'latitude';

  @Column({
    name: 'is_used',
    type: 'boolean',
    default: false,
  })
  isUsed: 'is_used' = 'is_used';

  @Column({ name: 'action', type: 'enum', enum: Action, nullable: true })
  action: 'action' = 'action';
}

export const student = new StudentsVisitKey();

//Type that represents the table Columns
export type TStudentsVisitkey = {
  [P in keyof typeof student as (typeof student)[P]]: (typeof student)[P];
};
