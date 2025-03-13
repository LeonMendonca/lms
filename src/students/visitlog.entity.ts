import { Students } from 'src/students/students.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UUID } from 'typeorm/driver/mongodb/bson.typings';


@Entity('visit_log')
export class VisitLog {
  @PrimaryGeneratedColumn('uuid', { name: 'visitlog_id' })
  visitlogId:'visitlogid' = 'visitlogid';
 
// @ManyToOne(() => Students, (student) => student.visitlog)
  @Column({ name: "student_uuid" , type:'uuid', nullable:true})
  student_UUID: "student_uuid" = "student_uuid";

  @Column({ name: 'timestamp' ,type:'timestamp' ,default: () => 'CURRENT_TIMESTAMP' })
  timestamp: 'timestamp'='timestamp';

  @Column({ name: 'action', type: 'varchar', length: 255 })
  action: 'action'='action';
}
