import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Students } from './students.entity';
import { StudentQueryDTO } from './dto/student.query-dto';
import { isUUID } from 'class-validator';

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
  async findStudentBy(query: object) {
    let requiredKey: keyof typeof StudentQueryDTO | undefined = undefined;
    let value: string | undefined = undefined;
    for (const key in StudentQueryDTO) {
      if (key in query) {
        requiredKey = key as keyof typeof StudentQueryDTO;
        value = query[key] as string;
        console.log('\nkeys is', requiredKey);
        break;
      }
    }
    if (requiredKey && value) {
      if (requiredKey === 'student_id' && !isUUID(value)) {
        throw new HttpException('Not a valid UUID!', HttpStatus.BAD_REQUEST);
      }
      return (await this.studentsRepository.query(
        `SELECT * FROM students_table WHERE ${requiredKey} = $1`,
        [value],
      )) as Students[];
    } else {
      throw new HttpException(
        `Search parameter email or student_id or phone_no required`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
