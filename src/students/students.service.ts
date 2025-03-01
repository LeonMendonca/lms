import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Students } from './students.entity';
import { StudentQueryValidator } from './student.query-validator';
import type { UnionUser } from './students.types';
import { TCreateStudentDTO } from './zod-validation/createstudents-zod';
import { insertQueryHelper, updateQueryHelper } from '../custom-query-helper';
import { TEditStudentDTO } from './zod-validation/putstudent-zod';
import { createStudentId } from "./create-student-id";
import { max } from 'class-validator';

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
      type TCreateStudentDTOWithID = TCreateStudentDTO & { student_id: string; count: number };
      //Get Maximum Student Count
      const maxCountColumn: [{ max: null | number}] = await this.studentsRepository.query(`SELECT MAX(count) from students_table`);
      let studentId: string = '';
      let queryResult: { student_id: string, count: number }[] = [];
      let count: number = 0;
      console.log("max column is", maxCountColumn);
      if(maxCountColumn[0].max) {
        studentId = createStudentId(maxCountColumn[0].max, studentPayload.institute_name);
        queryResult = await this.studentsRepository.query(
          `SELECT student_id, count from students_table WHERE count = (${maxCountColumn[0].max})`
        );
        count = queryResult[0].count;
      } else {
        studentId = createStudentId(null, studentPayload.institute_name);
      }
      let queryData = insertQueryHelper<TCreateStudentDTOWithID>({ ...studentPayload, student_id: studentId, count: ++count }, [
        'confirm_password',
      ]);
      await this.studentsRepository.query(
        `INSERT INTO students_table (${queryData.queryCol}) values (${queryData.queryArg})`,
        queryData.values,
      );
      return {
        statusCode: HttpStatus.CREATED,
        studentId: studentId,
      };
    } catch (error) {
      throw error;
    }
  }

  async editStudent(studentId: string, editStudentPayload: TEditStudentDTO) {
    try {
      let queryData = updateQueryHelper<TEditStudentDTO>(editStudentPayload, ['confirm_password', 'current_password']);
      const result = await this.studentsRepository.query(
        `
        UPDATE students_table SET ${queryData.queryCol} WHERE student_uuid = '${studentId}'
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
        `UPDATE students_table SET is_archived = true WHERE student_uuid = '${studentId}' AND is_archived = false`,
      );
      //Asserted a type as UPDATE returns it
      return result as [[], number];
    } catch (error) {
      throw error;
    }
  }
}
