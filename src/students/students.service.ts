import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Students } from './students.entity';
import { StudentQueryValidator } from './student.query-validator';
import type { UnionUser } from './students.types';
import { TCreateStudentDTO } from './zod-validation/createstudents-zod';
import { insertQueryHelper, updateQueryHelper } from '../custom-query-helper';
import { TEditStudentDTO } from './zod-validation/putstudent-zod';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Students)
    private studentsRepository: Repository<Students>,
  ) {}

  async findAllStudents() {
    return (await this.studentsRepository.query(
      'SELECT * from students_table WHERE is_archived = false',
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
      `SELECT * FROM students_table WHERE ${requiredKey} = $1 AND is_archived = false`,
      [value],
    )) as Students[];
  }

  async createStudent(studentPayload: TCreateStudentDTO) {
    try {
      let queryData = insertQueryHelper(studentPayload);
      await this.studentsRepository.query(
        `INSERT INTO students_table (${queryData.queryCol}) values (${queryData.queryArg})`,
        queryData.values,
      );
      return 'Inserted!!';
    } catch (error) {
      throw error;
    }
  }

  async editStudent(studentId: string, editStudentPayload: TEditStudentDTO) {
    try {
      let queryData = updateQueryHelper(editStudentPayload);
      const result = await this.studentsRepository.query(
        `
        UPDATE students_table SET ${queryData.queryCol} WHERE student_id = '${studentId}'
      `,
        queryData.values,
      );
      //Asserted a type as UPDATE returns it
      return result as [[], number];
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }

  async deleteStudent(studentId: string) {
    try {
      const result = await this.studentsRepository.query(
        `UPDATE students_table SET is_archived = true WHERE student_id = '${studentId}' AND is_archived = false`,
      );
      //Asserted a type as UPDATE returns it
      return result as [[], number];
    } catch (error) {
      throw error;
    }
  }
}
