import { Students } from 'src/students/students.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';


@Entity('visit_log')
export class VisitLog {
  @PrimaryGeneratedColumn('uuid', { name: 'visitlog_id' })
  visitlogId:'visitlogid' = 'visitlogid';

// @Column({name:'student_id', type:'uuid'})
// StudentId :'student_id'='student_id';
// relation 
@ManyToOne(() => Students, (student) => student.studentUUID)
  @JoinColumn({ name: "student_uuid" , })
  studentUUID: "student_uuid" = "student_uuid";

  @Column({ name: 'timestamp' ,type:'timestamp' ,default: () => 'CURRENT_TIMESTAMP' })
  timestamp: 'timestamp'='timestamp';

  @Column({ name: 'action', type: 'varchar', length: 255 })
  action: 'action'='action';
}
