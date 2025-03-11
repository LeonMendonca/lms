import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Students } from './students.entity';
import { StudentQueryValidator } from './students.query-validator';
import type { UnionUser } from './students.query-validator';
import { TCreateStudentDTO } from './zod-validation/createstudents-zod';
import { insertQueryHelper, selectQueryHelper, updateQueryHelper } from '../misc/custom-query-helper';
import { TEditStudentDTO } from './zod-validation/putstudent-zod';
import { createStudentId } from './create-student-id';
import { CreateWorker } from 'src/worker-threads/worker-main-thread';
import { TstudentUUIDZod } from './zod-validation/studentuuid-zod';
import { Chunkify } from 'src/worker-threads/chunk-array';
import { createObjectOmitProperties } from 'src/misc/create-object-from-class';

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
    } else {
      requiredKey = 'student_uuid';
      value = query.student_uuid;
    }

    //let studentObject = createObjectOmitProperties(new Students(), ['studentUUID', 'password']);
    //let newObject = {};

    ////Get all values of the object that are Column name in students_table
    //for(let key in studentObject) {
    //  newObject[studentObject[key]] = '';
    //}

    //const queryData = selectQueryHelper(newObject, [])
    const result = (await this.studentsRepository.query(
      `SELECT * FROM students_table WHERE ${requiredKey} = '${value}' AND is_archived = false`,
    )) as Students[];

    if(result.length === 0) {
      return null;
    }

    const filteredStudentObject = createObjectOmitProperties(result[0], ['password', 'isArchived']);
    console.log("data is", filteredStudentObject);
    return filteredStudentObject;
  }

  async createStudent2(studentPayload: TCreateStudentDTO) {
    try {
      type TCreateStudentDTOWithID = TCreateStudentDTO & {
        student_id: string;
      };
      const max: [{ max: null | string }] = await this.studentsRepository.query(
        `SELECT MAX(student_id) from students_table`,
      );
      let studentId = createStudentId(max[0].max, studentPayload.institute_name)
      let queryData = insertQueryHelper<TCreateStudentDTOWithID>(
        { ...studentPayload, student_id: studentId },
        ['confirm_password'],
      );
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

  //DEPRECATED
//  async createStudent(studentPayload: TCreateStudentDTO) {
//    try {
//      type TCreateStudentDTOWithID = TCreateStudentDTO & {
//        student_id: string;
//        count: number;
//      };
//      //Get Maximum Student Count
//      const maxCountColumn: [{ max: null | number }] =
//        await this.studentsRepository.query(
//          `SELECT MAX(count) from students_table`,
//        );
//      let studentId: string = '';
//      let queryResult: { student_id: string; count: number }[] = [];
//      let count: number = 0;
//      console.log('max column is', maxCountColumn);
//      if (maxCountColumn[0].max) {
//        //studentId = createStudentId(
//        //  maxCountColumn[0].max,
//        //  studentPayload.institute_name,
//        //);
//        queryResult = await this.studentsRepository.query(
//          `SELECT student_id, count from students_table WHERE count = (${maxCountColumn[0].max})`,
//        );
//        count = queryResult[0].count;
//      } else {
//        studentId = createStudentId(null, studentPayload.institute_name);
//      }
//      let queryData = insertQueryHelper<TCreateStudentDTOWithID>(
//        { ...studentPayload, student_id: studentId, count: ++count },
//        ['confirm_password'],
//      );
//      await this.studentsRepository.query(
//        `INSERT INTO students_table (${queryData.queryCol}) values (${queryData.queryArg})`,
//        queryData.values,
//      );
//      return {
//        statusCode: HttpStatus.CREATED,
//        studentId: studentId,
//      };
//    } catch (error) {
//      throw error;
//    }
//  }
//
  async bulkCreate(arrStudentPayload: TCreateStudentDTO[]) {
    return await (CreateWorker(arrStudentPayload, 'student/student-insert-worker') as Promise<TCreateStudentDTO[]>);
  }  

  async editStudent(studentUUID: string, editStudentPayload: TEditStudentDTO) {
    try {
      //NO Need to validate current_password
      //if (editStudentPayload.current_password && editStudentPayload.password) {
      //  const result: [{ password: string }] =
      //    await this.studentsRepository.query(
      //      `SELECT password from students_table WHERE password = $1 AND is_archived = false`,
      //      [editStudentPayload.current_password],
      //    );
      //  if (!result.length) {
      //    throw new Error('Invalid Password');
      //  }
      //}
      let queryData = updateQueryHelper<TEditStudentDTO>(editStudentPayload, [
        'confirm_password',
        'current_password',
      ]);
      const result = await this.studentsRepository.query(
        `
        UPDATE students_table SET ${queryData.queryCol} WHERE student_uuid = '${studentUUID}' AND is_archived = false
      `,
        queryData.values,
      );
      //Asserted a type as UPDATE returns it
      return result as [[], number];
    } catch (error) {
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

  async bulkDelete(arrStudentUUIDPayload: TstudentUUIDZod[]) {
    try {
      const zodValidatedBatchArr: TstudentUUIDZod[][] = Chunkify(arrStudentUUIDPayload);
      const BatchArr: Promise<TstudentUUIDZod[]>[] = [];
      for(let i = 0; i < zodValidatedBatchArr.length ; i++) {
          let result = CreateWorker<TstudentUUIDZod>(zodValidatedBatchArr[i], 'student/student-archive-worker' );
          BatchArr.push(result);
      }
      return await Promise.all(BatchArr);
    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    try {
      throw new Error("test");
    } catch (error) {
      throw error;
    } 
  }
}
