import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Students, TStudents } from './students.entity';
import { StudentQueryValidator } from './students.query-validator';
import type { UnionUser } from './students.query-validator';
import { TCreateStudentDTO } from './zod-validation/createstudents-zod';
import {
  insertQueryHelper,
  updateQueryHelper,
} from '../misc/custom-query-helper';
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

  async findAllStudents(
    { page, limit, search }: { page: number; limit: number; search: string } = {
      page: 1,
      limit: 10,
      search: '',
    },
  ) {
    const offset = (page - 1) * limit;
    const searchQuery = search ? `%${search}%` : '%';

    const students = await this.studentsRepository.query(
      'SELECT * from students_table WHERE is_archived = false AND student_name ILIKE $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [searchQuery, limit, offset],
    );

    const total = await this.studentsRepository.query(
      `SELECT COUNT(*) from students_table WHERE is_archived = false AND student_name ILIKE $1`,
      [searchQuery],
    );

    return {
      data: students,
      pagination: {
        total: parseInt(total[0].count, 10),
        page,
        limit,
        totalPages: Math.ceil(parseInt(total[0].count, 10) / limit),
      },
    };
  }

  async findStudentBy(query: UnionUser) {
    try {
      console.log("here")
      let requiredKey: keyof typeof StudentQueryValidator | undefined = undefined;
      let value: string | undefined = undefined;
      if ('student_id' in query) {
        requiredKey = 'student_id';
        value = query.student_id;
      } else {
        requiredKey = 'student_uuid';
        value = query.student_uuid;
      }

      const result = (await this.studentsRepository.query(
        `SELECT * FROM students_table WHERE ${requiredKey} = '${value}' AND is_archived = false`,
      )) as TStudents[];

      if (result.length === 0) {
        return null;
      }

      const filteredStudentObject = createObjectOmitProperties(result[0], [
        'password',
        'is_archived',
      ]);
      return filteredStudentObject; 
    } catch (error) {
      throw error;
    }
    
  }

  async createStudent(studentPayload: TCreateStudentDTO) {
    try {
      type TCreateStudentDTOWithID = TCreateStudentDTO & {
        student_id: string;
      };
      const max: [{ max: null | string }] = await this.studentsRepository.query(
        `SELECT MAX(student_id) from students_table`,
      );
      let studentId = createStudentId(
        max[0].max,
        studentPayload.institute_name,
      );
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

  async bulkCreate(arrStudentPayload: TCreateStudentDTO[]) {
    return await (CreateWorker(
      arrStudentPayload,
      'student/student-insert-worker',
    ) as Promise<TCreateStudentDTO[]>);
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
      const zodValidatedBatchArr: TstudentUUIDZod[][] = Chunkify(
        arrStudentUUIDPayload,
      );
      const BatchArr: Promise<TstudentUUIDZod[]>[] = [];
      for (let i = 0; i < zodValidatedBatchArr.length; i++) {
        let result = CreateWorker<TstudentUUIDZod>(
          zodValidatedBatchArr[i],
          'student/student-archive-worker',
        );
        BatchArr.push(result);
      }
      const arrayOfUnableToArchive = ((await Promise.all(BatchArr)).flat());
      //if(arrayOfUnableToArchive.length === 0) {
      //  return null;
      //}
      return arrayOfUnableToArchive;
    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    try {
      throw new Error('test');
    } catch (error) {
      throw error;
    }
  }

  async findAllArchivedStudents(
    { page, limit, search }: { page: number; limit: number; search: string } = {
      page: 1,
      limit: 10,
      search: '',
    },
  ) {
    try {
      const offset = (page - 1) * limit;
      const searchQuery = search ? '%${search}%' : '%';

      const students = await this.studentsRepository.query(
        'SELECT * from students_table WHERE is_archived = true AND student_name ILIKE $1 LIMIT $2 OFFSET $3',
        [searchQuery, limit, offset],
      );

      const total = await this.studentsRepository.query(
        `SELECT COUNT(*) from students_table WHERE is_archived = true AND student_name ILIKE $1`,
        [searchQuery],
      );

      return {
        data: students,
        pagination: {
          total: parseInt(total[0].count, 10),
          page,
          limit,
          totalPages: Math.ceil(parseInt(total[0].count, 10) / limit),
        },
      }; 
    } catch (error) {
      throw error;
    }
    
  }

  async updateStudentArchive(student_uuid: string, student_id: string) {
    try {
      const result: [[], number] = await this.studentsRepository.query(
        `UPDATE students_table SET is_archived = true WHERE (student_uuid = $1 OR student_id = $2) AND is_archived = false`,
        [student_uuid, student_id],
      );
      return result[1];
    } catch (error) {
      throw error;
    }
  }

  async restoreStudentArchive(student_uuid: string, student_id: string) {
    try {
      const result: [[], number] = await this.studentsRepository.query(
        `UPDATE students_table SET is_archived = false WHERE (student_uuid = $1 OR student_id = $2) AND is_archived = true`,
        [student_uuid, student_id],
      );
      return result[1];
    } catch (error) {
      throw error;
    }
  }

  async exportAllStudents() {
    const students = await this.studentsRepository.query(
      'SELECT * from students_table WHERE is_archived = false',
    ) as TStudents[];

    return {
      data: students,
    };
  }
}
