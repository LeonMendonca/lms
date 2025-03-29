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

  @Column({ name: "student_id" , type:'varchar', nullable:true})
  student_ID: "student_id" = "student_id";

  @Column({ name: 'visitor_name', type: 'varchar', length: 255, })
  visitorName: 'visitor_name'='visitor_name';

  @Column({ name: 'department', type: 'varchar', length: 255 })
  department: 'department'='department';

  // @Column({ name: 'computer_temp', type: 'varchar', length: 255 })
  // computer_temp: 'computer_temp'='computer_temp';

  @Column({ name: 'action', type: 'varchar', length: 255 })
  action: 'action'='action';

  @Column({ name: 'in_time' ,type:'timestamp' ,default: () => 'CURRENT_TIMESTAMP', nullable:true })
  inTime: 'in_time'='in_time';

  @Column({ name: 'out_time' ,type:'timestamp' ,default: () => 'CURRENT_TIMESTAMP', nullable:true })
  outTime: 'out_time'='out_time';
}
