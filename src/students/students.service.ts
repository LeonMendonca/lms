import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Students } from './students.entity';
import { StudentQueryValidator } from './student.query-validator';
import { isUUID } from 'class-validator';
import { UnionUser } from './student.pipe';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Students)
    private studentsRepository: Repository<Students>,
  ) {}

  async findAllStudents() {
    return (await this.studentsRepository.query(
      'SELECT * from students_table',
    )) as Students[];
  }
  async findStudentBy(query: UnionUser) {
    let requiredKey: keyof typeof StudentQueryValidator | undefined = undefined;
    let value: string | undefined = undefined;
    if ('student_id' in query) {
      requiredKey = 'student_id';
      value = query.student_id;
    } else if ('email' in query) {
      requiredKey = 'email';
      value = query.email;
    } else {
      requiredKey = 'phone_no';
      value = query.phone_no;
    }
    return (await this.studentsRepository.query(
      `SELECT * FROM students_table WHERE ${requiredKey} = $1`,
      [value],
    )) as Students[];
  }
}
