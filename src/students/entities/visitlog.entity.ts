import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('visit_log')
export class VisitLog {
  @PrimaryGeneratedColumn('uuid', { name: 'visitLogId' })
  visitLogId: string;

  @Column({ name: 'studentUuid', type: 'uuid' })
  studentUuid: string;

  @Column({ name: 'studentName', type: 'varchar', length: 255 })
  studentName: string;

  @Column({ name: 'department', type: 'varchar', length: 255 })
  department: string;

  @Column({ name: 'instituteUuid', type: 'uuid' })
  instituteUuid: string;

  @Column({ name: 'instituteName', type: 'varchar' })
  instituteName: string;

  @Column({ name: 'action', type: 'varchar', length: 255 })
  action: string;

  @Column({
    name: 'inTime',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  inTime: Date;

  @Column({
    name: 'outTime',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: true,
  })
  outTime: Date;
}
