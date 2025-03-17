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
import { TVisit_log } from './zod-validation/visitlog';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Students)
    private studentsRepository: Repository<Students>,
  ) {}


  async findAllStudents({
    page,
    limit,
    search,
    department,
    year,
  }: {
    page: number;
    limit: number;
    search?: string;
    department?: string;
    year?: string;
  }) {
    const offset = (page - 1) * limit;
    const queryParams: any[] = [];
    let query = `SELECT * FROM students_table WHERE is_archived = false`;
  
    if (search) {
      query += ` AND student_name ILIKE $${queryParams.length + 1}`;
      queryParams.push(`%${search}%`);
    }
  
    if (department) {
      query += ` AND department = $${queryParams.length + 1}`;
      queryParams.push(department);
    }
  
    if (year) {
      query += ` AND year_of_admission = $${queryParams.length + 1}`;
      queryParams.push(year);
    }
  
    query += ` ORDER BY year_of_admission DESC, department DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);
  
    const students = await this.studentsRepository.query(query, queryParams);
  
    const totalQuery = `SELECT COUNT(*) FROM students_table WHERE is_archived = false`;
    const total = await this.studentsRepository.query(totalQuery);
  
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
    )) as TStudents[];

    if (result.length === 0) {
      return null;
    }

    const filteredStudentObject = createObjectOmitProperties(result[0], [
      'student_uuid',
      'password',
      'is_archived',
    ]);
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
      return await Promise.all(BatchArr);
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
  }

  async updateStudentArchive(student_uuid: string, student_id: string) {
    try {
      const student = await this.studentsRepository.query(
        `SELECT * FROM students_table WHERE (student_uuid = $1 OR student_id = $2) AND is_archived = false LIMIT 1`,
        [student_uuid, student_id],
      );
      console.log({ student });

      if (student.length === 0) {
        throw new HttpException(
          'Student not found or already archived',
          HttpStatus.NOT_FOUND,
        );
      }
      await this.studentsRepository.query(
        `UPDATE students_table SET is_archived = true WHERE student_uuid = $1 OR student_id = $2`,
        [student_uuid, student_id],
      );

      return { message: 'Student archived successfully' };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Error archiving student',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async restoreStudentArchive(student_uuid: string, student_id: string) {
    try {
      // Fetch student who is currently archived
      const student = await this.studentsRepository.query(
        `SELECT * FROM students_table 
         WHERE (student_uuid = $1 OR student_id = $2) 
         AND is_archived = true 
         LIMIT 1`, // Ensures only one student is retrieved
        [student_uuid, student_id],
      );

      console.log({ student });

      if (student.length === 0) {
        throw new HttpException(
          'Student not found or not archived',
          HttpStatus.NOT_FOUND,
        );
      }

      // Restore the student (set is_archived to false)
      const updateResult = await this.studentsRepository.query(
        `UPDATE students_table 
         SET is_archived = false 
         WHERE (student_uuid = $1 OR student_id = $2) 
         AND is_archived = true 
         RETURNING *`, // Confirms the update was successful
        [student_uuid, student_id],
      );

      if (updateResult.length === 0) {
        throw new HttpException(
          'Failed to restore student',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return { message: 'Student restored successfully' };
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Error restoring student',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
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
// visit log 
async getVisitAllLog(){
  try {
  const data=await this.studentsRepository.query(`SELECT * FROM visit_log`);
  return data
  } catch (error) {
    throw new HttpException(
      `Error ${error} something went wrong in all log !1`,
      HttpStatus.INTERNAL_SERVER_ERROR,);
  }
}
  async getVisitLogByStudentUUID(student_uuid: string){
    try {
      return await this.studentsRepository.query(
        `SELECT * FROM visit_log WHERE student_uuid = $1`, [student_uuid]
      );
    } catch (error) {
      throw new HttpException(
        `Error ${error} invalid  student_uuid`,
        HttpStatus.INTERNAL_SERVER_ERROR,);
    }
  }
  async visitlogentry(createvisitpayload:TVisit_log) {
    try {
     const result=await this.studentsRepository.query(`SELECT student_uuid,department,student_name, addmore .. FROM STUDENTS_TABLE WHERE STUDENT_ID=$1`,[createvisitpayload.student_id])
     if (result.length === 0) {
      throw new HttpException(
        { message: "Invalid student ID" },
        HttpStatus.BAD_REQUEST
      );
    }
     await this.studentsRepository.query(
        `INSERT INTO visit_log (student_uuid, action) VALUES ($1, 'entry')`,
        [student_uuid]
      );
      return {
        message: "Visit log entry created successfully",
        student_uuid: student_uuid,
        timestamp: new Date().toISOString(), // Adding timestamp for clarity
      };
    } catch (error) {
      throw new HttpException(
        `Error ${error} something went wrong in visit entry!!`,
        HttpStatus.INTERNAL_SERVER_ERROR,);
    }
  } 
  async visitlogexit(student_uuid: string) {
    try {
        // 1 Validate if student exists
        const studentExists = await this.studentsRepository.query(
            `SELECT 1 FROM STUDENTS_TABLE WHERE STUDENT_UUID=$1`, 
            [student_uuid]
        );
  
        if (studentExists.length === 0) {
            throw new HttpException(
                { message: "Invalid student ID" },
                HttpStatus.BAD_REQUEST
            );
        }
  
        // 2 Get last visit log entry
        const lastEntry = await this.studentsRepository.query(
            `SELECT action FROM visit_log 
             WHERE student_uuid=$1 
             ORDER BY timestamp DESC 
             LIMIT 1`,
            [student_uuid]
        );
  
        // 3 Ensure last action was 'entry' before logging 'exit'
        if (lastEntry.length === 0 || lastEntry[0].action !== 'entry') {
            throw new HttpException(
                { message: "No prior entry log found. Entry is required before exit." },
                HttpStatus.BAD_REQUEST
            );
        }
  
        // 4 Insert exit log
        await this.studentsRepository.query(
            `INSERT INTO visit_log (student_uuid, action) VALUES ($1, 'exit')`,
            [student_uuid]
        );
  
        return {
            message: "Exit log created successfully",
            student_uuid,
            timestamp: new Date().toISOString(),
        };
  
    } catch (error) {
        throw new HttpException(
            `Error: ${error.message || error} while processing visit log in  visit exit `,
            HttpStatus.INTERNAL_SERVER_ERROR
        );
    }
  }
  
  

}
