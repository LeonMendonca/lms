import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';


@Entity('visit_log')
export class VisitLog {
  @PrimaryGeneratedColumn('uuid', { name: 'visitlog_id' })
  visitlogId:'visitlogid' = 'visitlogid';

@Column({name:'student_id', type:'uuid', nullable:true})
StudentId :'student_id'='student_id';

  @Column({ name: 'timestamp' , nullable:true})
  timestamp: 'timestamp'='timestamp';

  @Column({ name: 'action', type: 'varchar', length: 255 })
  action: 'action'='action';
}
