import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Students, TStudents } from './students.entity';
import { StudentQueryValidator } from './students.query-validator';
import type { UnionStudent } from './students.query-validator';
import { TCreateStudentDTO } from './zod-validation/createstudents-zod';
import {
  insertQueryHelper,
  updateQueryHelper,
} from '../misc/custom-query-helper';
import { TEditStudentDTO } from './zod-validation/putstudent-zod';
import { createStudentId, createStudentId2 } from './create-student-id';
import { CreateWorker } from 'src/worker-threads/worker-main-thread';
import { TstudentUUIDZod } from './zod-validation/studentuuid-zod';
import { Chunkify } from 'src/worker-threads/chunk-array';
import { createObjectOmitProperties } from 'src/misc/create-object-from-class';
import { TVisit_log } from './zod-validation/visitlog';
import { count } from 'console';

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
    const searchQuery = search ? `%${search}%` : '%';

    const students = await this.studentsRepository.query(
      'SELECT * from students_table WHERE is_archived = false AND student_name ILIKE $1 ORDER BY updated_at DESC  LIMIT $2 OFFSET $3 ',
      [searchQuery, limit, offset],
    );

    const total = await this.studentsRepository.query(
      `SELECT COUNT(*) from students_table WHERE is_archived = false AND student_name ILIKE $1`,
      [searchQuery],
    );

    // const queryParams: any[] = [];
    // let query = `SELECT * FROM students_table WHERE is_archived = false`;

    // if (search) {
    //   query += ` AND student_name ILIKE $${queryParams.length + 1}`;
    //   queryParams.push(`%${search}%`);
    // }

    // if (department) {
    //   query += ` AND department = $${queryParams.length + 1}`;
    //   queryParams.push(department);
    // }

    // if (year) {
    //   query += ` AND year_of_admission = $${queryParams.length + 1}`;
    //   queryParams.push(year);
    // }

    // query += ` ORDER BY year_of_admission DESC, department DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    // queryParams.push(limit, offset);

    // const students = await this.studentsRepository.query(query, queryParams);

    // const totalQuery = `SELECT COUNT(*) FROM students_tab

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

  async getAllDepartments(): Promise<string[]> {
    try {
      console.log('Fetching departments...');
      const departments = await this.studentsRepository.query(
        'SELECT DISTINCT department FROM students_table WHERE is_archived = false',
      );
      return (
        departments?.map((dept: { department: string }) => dept.department) ||
        []
      );
    } catch (error) {
      throw error;
    }
  }

  async findStudentBy(query: UnionStudent) {
    try {
      let requiredKey: keyof typeof StudentQueryValidator | undefined =
        undefined;
      let value: string | undefined = undefined;
      if ('student_id' in query) {
        requiredKey = 'student_id';
        value = query.student_id;
      } else {
        requiredKey = 'student_uuid';
        value = query.student_uuid;
      }

      const result = (await this.studentsRepository.query(
        `SELECT * FROM students_table WHERE ${requiredKey} = '${value}' `,
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

  // async createStudent(studentPayload: TCreateStudentDTO) {
  //   try {
  //     type TCreateStudentDTOWithID = TCreateStudentDTO & {
  //       student_id: string;
  //     };
  //     const max: [{ max: null | string }] = await this.studentsRepository.query(
  //       `SELECT MAX(student_id) from students_table`,
  //     );
  //     let studentId = createStudentId(
  //       max[0].max,
  //       studentPayload.institute_name,
  //     );
  //     let queryData = insertQueryHelper<TCreateStudentDTOWithID>(
  //       { ...studentPayload, student_id: studentId },
  //       [],
  //     );
  //     await this.studentsRepository.query(
  //       `INSERT INTO students_table (${queryData.queryCol}) values (${queryData.queryArg})`,
  //       queryData.values,
  //     );
  //     return {
  //       statusCode: HttpStatus.CREATED,
  //       studentId: studentId,
  //     };
  //   } catch (error) {
  //     throw error;
  //   }
  // }

   async createStudent(studentPayload: TCreateStudentDTO) {
      try {
        console.log("part1");
        type TCreateStudentDTOWithID = TCreateStudentDTO & {
          student_id: string;
        };
        const max: [{ max: null | string }] = await this.studentsRepository.query(
          `SELECT MAX(student_id) from students_table`,
        );
        const count: [{ count: null | string }] = await this.studentsRepository.query(
          `SELECT count(student_id) from students_table`,
        );
        const deptcount: [{ deptcount: null | string }] = await this.studentsRepository.query(
          `SELECT count(*) AS deptcount from students_table WHERE department=$1`,[studentPayload.department]
        );
        let studentId = createStudentId(
          max[0].max,
          studentPayload.institute_name,
        );

        let studentId2 = createStudentId2(
          count[0].count,
          deptcount[0].deptcount,
          studentPayload.institute_name,
          studentPayload.department
        );

       

        let queryData = insertQueryHelper<TCreateStudentDTOWithID>(
          { ...studentPayload, student_id: studentId2 },
          [],
        );
        await this.studentsRepository.query(
          `INSERT INTO students_table (${queryData.queryCol}) values (${queryData.queryArg})`,
          queryData.values,
        );
        return {
          statusCode: HttpStatus.CREATED,
          studentId: studentId2,
        };
      } catch (error) {
        throw error;
      }
    }
  
 

  async bulkCreate(arrStudentPayload: TCreateStudentDTO[]) {
    console.log("SERVICE calling main worker thread");
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
      const arrayOfArchived = (await Promise.all(BatchArr)).flat();
      return arrayOfArchived;
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
    const students = (await this.studentsRepository.query(
      'SELECT * from students_table WHERE is_archived = false',
    )) as TStudents[];

    return {
      data: students,
    };
  }
  // visit log
  async getVisitAllLog(
    { page, limit }: { page: number; limit: number } = {
      page: 1,
      limit: 10,
    },
  ) {
    try {
      const offset = (page - 1) * limit;

      const visit_log = await this.studentsRepository.query(
        `SELECT * FROM visit_log LIMIT $1 OFFSET $2`,
        [limit, offset],
      );
      const total = await this.studentsRepository.query(
        `SELECT COUNT(*) FROM visit_log`,
      );
      if(visit_log.length === 0){
        throw new HttpException("no log data found", HttpStatus.NOT_FOUND);
      }
      return {
        data: visit_log,
        pagination: {
          total: parseInt(total[0].count, 10),
          page,
          limit,
          totalPages: Math.ceil(parseInt(total[0].count, 10) / limit),
        },
      };
    } catch (error) {
      throw new HttpException(
        `Error ${error} something went wrong in all log !1`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  //

  async getVisitLogByStudentUUID({
    student_id,
    page,
    limit,
  }: {
    student_id: string;
    page: number;
    limit: number;
  }) {
    try {
      const offset = (page - 1) * limit;

      // Fetch paginated results
      const visitLogs = await this.studentsRepository.query(
        `SELECT * FROM visit_log WHERE student_id = $1 ORDER BY in_time DESC LIMIT $2 OFFSET $3`,
        [student_id, limit, offset],
      );

      // Get the total count of records
      const totalResult = await this.studentsRepository.query(
        `SELECT COUNT(*) as total FROM visit_log WHERE student_id = $1`,
        [student_id],
      );

      // const total = parseInt(totalResult[0].total, 10);
      // const totalPages = Math.ceil(total / limit);
 if(visitLogs.length === 0){
        throw new HttpException("no log data found", HttpStatus.NOT_FOUND);}
      return {
        data: visitLogs,
        // pagination: {
        //   totalRecords: total,
        //   currentPage: page,
        //   limitPerPage: limit,
        //   totalPages: totalPages,
        // },
        pagination: {
          total: parseInt(totalResult[0].total, 10),
          page,
          limit,
          totalPages: Math.ceil(parseInt(totalResult[0].total, 10) / limit),
        },
      };
    } catch (error) {
      throw new HttpException(
        `Error: ${error.message} - Invalid student_id`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async visitlogentry(createvisitpayload: TVisit_log) {
    try {
      // 1. Validate if student exists
      const result: {
        student_uuid: string;
        department: string;
        student_name: string;
      }[] = await this.studentsRepository.query(
        `SELECT student_uuid, department, student_name 
                 FROM STUDENTS_TABLE 
                 WHERE STUDENT_ID=$1`,
        [createvisitpayload.student_id],
      );

      if (result.length === 0) {
        throw new HttpException(
          { message: 'Invalid student ID' },
          HttpStatus.BAD_REQUEST,
        );
      }

      const student_uuid = result[0].student_uuid;

      // 2. Check if the student has a previous visit log
      const lastEntry = await this.studentsRepository.query(
        `SELECT action FROM visit_log 
             WHERE student_uuid = $1 
             ORDER BY in_time DESC 
             LIMIT 1`,
        [student_uuid],
      );

      // 3. Ensure last action was 'exit' OR there is no record (first-time entry)
      if (lastEntry.length > 0 && lastEntry[0].action === 'entry') {
        throw new HttpException(
          {
            message:
              'Previous entry not exited. Exit required before new entry.',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // 4. Insert new entry log
      await this.studentsRepository.query(
        `INSERT INTO visit_log (student_uuid, visitor_name, department, student_id, action, in_time, out_time) 
             VALUES ($1, $2, $3, $4, 'entry', now(), null)`,
        [
          student_uuid,
          result[0].student_name,
          result[0].department,
          createvisitpayload.student_id,
        ],
      );

      return {
        message: 'Visit log entry created successfully',
        student_id: createvisitpayload.student_id,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        `Error: ${error.message || error} while processing visit log entry.`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async visitlogexit(createvlogpayload: TVisit_log) {
    try {
      // 1. Validate if student exists
      const studentExists = await this.studentsRepository.query(
        `SELECT * FROM students_table WHERE student_id=$1`,
        [createvlogpayload.student_id],
      );

      if (studentExists.length === 0) {
        throw new HttpException(
          { message: 'Invalid student ID' },
          HttpStatus.BAD_REQUEST,
        );
      }

      // 2. Get the last 'entry' log that has no 'out_time'
      const lastEntry = await this.studentsRepository.query(
        `SELECT student_uuid, in_time FROM visit_log 
             WHERE student_id=$1 AND action='entry' AND out_time IS NULL 
             ORDER BY in_time DESC 
             LIMIT 1`,
        [createvlogpayload.student_id],
      );
      // 3. Ensure there is a valid 'entry' log to update
      if (lastEntry.length === 0) {
        throw new HttpException(
          {
            message:
              'No open entry log found. A valid entry is required before exit.',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      // 4. Capture the current timestamp for exit
      const exitTime = new Date().toISOString();
      console.log('working4');
      // 5. Update the last 'entry' log by setting 'out_time' (exit_time) and changing action to 'exit'
      await this.studentsRepository.query(
        `UPDATE visit_log 
             SET out_time = now(), action = 'exit'
             WHERE student_id = $1`,
        [createvlogpayload.student_id],
      );
      return {
        message: 'Exit log updated successfully',
        student_id: createvlogpayload.student_id,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        `Error: ${error.message || error} while processing visit log exit.`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async studentProfile(student_id: string){
    try {
      const result = await this.studentsRepository.query(`SELECT student_name, department, email, roll_no, year_of_admission, phone_no, address FROM students_table WHERE student_id= $1`, [student_id]) 
     if(result.length === 0){
      throw new HttpException("invalid Student ID !!", HttpStatus.BAD_REQUEST);
     }
      return result;
    } catch (error) {
      throw error;
    }
  }

}
