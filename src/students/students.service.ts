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
const jwt = require('jsonwebtoken');
import { TEditStudentDTO } from './zod-validation/putstudent-zod';
import { createStudentId, createStudentId2 } from './create-student-id';
import { CreateWorker } from 'src/worker-threads/worker-main-thread';
import { TstudentUUIDZod } from './zod-validation/studentuuid-zod';
import { Chunkify } from 'src/worker-threads/chunk-array';
import { createObjectOmitProperties } from 'src/misc/create-object-from-class';
import { TVisit_log } from './zod-validation/visitlog';
import { TStudentCredZodType } from './zod-validation/studentcred-zod';
import { setTokenFromPayload } from 'src/jwt/jwt-main';
import { TInsertResult } from 'src/worker-threads/student/student-insert-worker';
import { TUpdateResult } from 'src/worker-threads/student/student-archive-worker';
import { isWithin30Meters } from './utilities/location-calculation';
import { StudentsVisitKey, TStudentsVisitkey } from './entities/student-visit-key';

interface DataWithPagination<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface Data<T> {
  data: T;
  pagination: null;
}

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
  }: {
    page: number;
    limit: number;
    search?: string;
    department?: string;
    year?: string;
  }): Promise<DataWithPagination<Students>> {
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

  async getAllDepartments() {
    try {
      console.log('Fetching departments...');
      const departments = await this.studentsRepository.query(
        'SELECT DISTINCT department FROM students_table WHERE is_archived = false',
      );
      return {
        data:
          departments?.map((dept: { department: string }) => dept.department) ||
          [],
      };
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

  async createStudent(studentPayload: TCreateStudentDTO): Promise<Students> {
    try {
      let queryData = insertQueryHelper(studentPayload, []);
      const result = await this.studentsRepository.query(
        `INSERT INTO students_table (${queryData.queryCol}) values (${queryData.queryArg}) RETURNING student_uuid`,
        queryData.values,
      );

      const studentUuid = result[0]?.student_uuid;
      if (!studentUuid) {
        throw new HttpException(
          'Failed to fetch created student',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const student = await this.studentsRepository.query(
        `SELECT * FROM students_table WHERE student_uuid = $1`,
        [studentUuid],
      );

      if (!student.length) {
        throw new HttpException(
          'Student not found after creation',
          HttpStatus.NOT_FOUND,
        );
      }

      return student[0];
    } catch (error) {
      console.log(error);
      throw new HttpException(
        `Error: ${error.message || error} while creating student.`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async bulkCreate(studentZodValidatedObject: {
    validated_array: TCreateStudentDTO[];
    invalid_data_count: number;
  }) {
    try {
      console.log('SERVICE calling main worker thread');

      const {
        inserted_data,
        duplicate_data_pl,
        unique_data,
        duplicate_date_db,
      }: TInsertResult = await CreateWorker(
        studentZodValidatedObject.validated_array,
        'student/student-insert-worker',
      );
      return {
        invalid_data: studentZodValidatedObject.invalid_data_count,
        inserted_data,
        duplicate_data_pl,
        duplicate_date_db,
        unique_data,
      };
    } catch (error) {
      throw error;
    }
  }

  async editStudent(
    studentId: string,
    editStudentPayload: TEditStudentDTO,
  ): Promise<Students> {
    try {
      let queryData = updateQueryHelper<TEditStudentDTO>(
        editStudentPayload,
        [],
      );
      const result = await this.studentsRepository.query(
        `UPDATE students_table SET ${queryData.queryCol} WHERE student_id = '${studentId}' AND is_archived = false RETURNING *`,
        queryData.values,
      );
      if (!result.length) {
        throw new HttpException(
          'Student not found after update',
          HttpStatus.NOT_FOUND,
        );
      }
      return result[0];
    } catch (error) {
      throw error;
    }
  }

  async deleteStudent(studentId: string) {
    try {
      const result = await this.studentsRepository.query(
        `UPDATE students_table SET is_archived = TRUE WHERE student_id = '${studentId}' AND is_archived = false`,
      );
      //Asserted a type as UPDATE returns it
      return result as [[], number];
    } catch (error) {
      throw error;
    }
  }

  async bulkDelete(arrStudentUUIDPayload: {
    validated_array: TstudentUUIDZod[];
    invalid_data_count: number;
  }) {
    try {
      const zodValidatedBatchArr: TstudentUUIDZod[][] = Chunkify(
        arrStudentUUIDPayload.validated_array,
      );
      const BatchArr: Promise<TUpdateResult>[] = [];
      for (let i = 0; i < zodValidatedBatchArr.length; i++) {
        const result = CreateWorker<TstudentUUIDZod>(
          zodValidatedBatchArr[i],
          'student/student-archive-worker',
        );
        BatchArr.push(result);
      }
      const arrOfWorkerRes = await Promise.all(BatchArr);
      const { archived_data, failed_archived_data } = arrOfWorkerRes.reduce(
        (prevItem, currItem) => {
          return {
            archived_data: prevItem.archived_data + currItem.archived_data,
            failed_archived_data:
              prevItem.failed_archived_data + currItem.failed_archived_data,
          };
        },
      );
      return {
        invalid_data: arrStudentUUIDPayload.invalid_data_count,
        archived_data,
        failed_archived_data,
      };
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
      if (visit_log.length === 0) {
        throw new HttpException('no log data found', HttpStatus.NOT_FOUND);
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
      if (visitLogs.length === 0) {
        throw new HttpException('no log data found', HttpStatus.NOT_FOUND);
      }
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

  async studentProfile(student_id: string) {
    try {
      const result = await this.studentsRepository.query(
        `SELECT student_name, department, email, roll_no, year_of_admission, phone_no, address FROM students_table WHERE student_id= $1`,
        [student_id],
      );
      if (result.length === 0) {
        throw new HttpException(
          'invalid Student ID !!',
          HttpStatus.BAD_REQUEST,
        );
      }
      return result;
    } catch (error) {
      throw error;
    }
  }

  async studentLogin(studentCredPayload: TStudentCredZodType) {
    try {
      const jwtPayload = await this.studentsRepository.query(
        `SELECT * FROM students_table WHERE (email = $1 OR student_id = $1) AND password = $2`,
        [studentCredPayload.email_or_student_id, studentCredPayload.password],
      );

      if (!jwtPayload.length) {
        throw new HttpException('Invalid Credential', HttpStatus.FORBIDDEN);
      }

      const jwtPayloadSelective = {
        student_id: jwtPayload[0].student_id,
        email: jwtPayload[0].email,
      };

      delete jwtPayload[0].password;

      return {
        token: { accessToken: setTokenFromPayload(jwtPayloadSelective) },
        user: {
          ...jwtPayload[0],
          institute_image:
            'https://admissionuploads.s3.amazonaws.com/3302d8ef-0a5d-489d-81f9-7b1f689427be_Tia_logo.png',
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async studentDashboard(user: any) {
    try {
      console.log(user);
      const student = await this.studentsRepository.query(
        `SELECT student_uuid FROM students_table WHERE student_id= $1`,
        [user.student_id],
      );
      const totalBooks = await this.studentsRepository.query(
        `SELECT COUNT(*) FROM book_copies WHERE is_archived = false`,
      );
      const availableBooks = await this.studentsRepository.query(
        `SELECT COUNT(*) FROM book_copies WHERE is_archived = false AND is_available = true`,
      );
      const newBooks = await this.studentsRepository.query(
        `SELECT COUNT(*) FROM book_copies WHERE is_archived = false AND is_available = true AND created_at >= NOW() - INTERVAL '1 month'`,
      );
      const yearlyBorrow = await this.studentsRepository.query(
        `SELECT COUNT(*) FROM book_logv2 WHERE borrower_uuid = $1 AND date >= DATE_TRUNC('year', NOW()) + INTERVAL '5 months' - INTERVAL '1 year'
   AND date < DATE_TRUNC('year', NOW()) + INTERVAL '5 months'`,
        [student[0].student_uuid],
      );
      const totalBorrowedBooks = await this.studentsRepository.query(
        `SELECT COUNT(*) FROM book_logv2 WHERE borrower_uuid = $1 `,
        [student[0].student_uuid],
      );

      //Asserted a type as UPDATE returns it
      return {
        totalBooks: totalBooks[0].count,
        availableBooks: availableBooks[0].count,
        newBooks: newBooks[0].count,
        yearlyBorrow: yearlyBorrow[0].count,
        totalBorrowedBooks: totalBorrowedBooks[0].count,
      };
    } catch (error) {
      throw error;
    }
  }

  async adminDashboard(instituteUUID: string | null) {
    try {
      // Adjust the query for totalBooks
      const totalBooksQuery = `
        SELECT COUNT(*) 
        FROM book_copies 
        WHERE is_archived = false
        ${instituteUUID ? 'AND institute_uuid = $1' : ''}
      `;
      const totalBooks = await this.studentsRepository.query(
        totalBooksQuery,
        instituteUUID ? [instituteUUID] : [],
      );

      // Adjust the query for totalBorrowedBooks
      const totalBorrowedBooksQuery = `
        SELECT COUNT(*) 
        FROM book_logv2 
        LEFT JOIN book_copies ON book_logv2.book_copy_uuid = book_copies.book_copy_uuid 
        WHERE book_copies.is_archived = false
        ${instituteUUID ? 'AND book_copies.institute_uuid = $1' : ''}
      `;
      const totalBorrowedBooks = await this.studentsRepository.query(
        totalBorrowedBooksQuery,
        instituteUUID ? [instituteUUID] : [],
      );

      // Adjust the query for totalMembers
      const totalMembersQuery = `
        SELECT COUNT(*) 
        FROM students_table 
        WHERE is_archived = false
        ${instituteUUID ? 'AND institute_uuid = $1' : ''}
      `;
      const totalMembers = await this.studentsRepository.query(
        totalMembersQuery,
        instituteUUID ? [instituteUUID] : [],
      );

      // Adjust the query for newBooks (not filtered by instituteUUID as there's no filter for it)
      const newBooksQuery = `
        SELECT COUNT(*) 
        FROM book_copies 
        WHERE is_archived = false 
          AND is_available = true 
          AND created_at >= NOW() - INTERVAL '1 month'
      `;
      const newBooks = await this.studentsRepository.query(newBooksQuery);

      return {
        totalBooks: totalBooks[0].count,
        totalBorrowedBooks: totalBorrowedBooks[0].count,
        totalMembers: totalMembers[0].count,
        newBooks: newBooks[0].count,
      };
    } catch (error) {
      throw error;
    }
  }

  async adminDashboardCsvDownload(instituteUUID: string | null, type: string) {
    try {
      switch (type) {
        case 'totalBooks':
          const totalBooksQuery = `
            SELECT book_title_id,book_title,book_author,name_of_publisher,place_of_publication,year_of_publication,edition,isbn,no_of_pages,no_of_preliminary, subject,department, call_number, author_mark,title_description, book_copy_id,  source_of_acquisition, date_of_acquisition, bill_no, language, inventory_number, accession_number, barcode, item_type, institute_name, bc.created_at, remarks, copy_description, is_available 
            FROM book_copies bc LEFT JOIN book_titles bt ON bc.book_title_uuid = bt.book_uuid
            WHERE bc.is_archived = false
            ${instituteUUID ? 'AND institute_uuid = $1' : ''}
          `;
          const totalBooks = await this.studentsRepository.query(
            totalBooksQuery,
            instituteUUID ? [instituteUUID] : [],
          );
          return totalBooks;
        case 'borrowedBooks':
          const totalBorrowedBooksQuery = `
            SELECT book_title_id,book_title,book_author,name_of_publisher,place_of_publication,year_of_publication,edition,isbn,no_of_pages,no_of_preliminary, subject,department, call_number, author_mark,title_description, book_copy_id,  source_of_acquisition, date_of_acquisition, bill_no, language, inventory_number, accession_number, barcode, item_type, institute_name, bc.created_at, remarks, copy_description, is_available, ip_address, action, description
            FROM book_logv2 bl
            LEFT JOIN book_copies bc ON bl.book_copy_uuid = bc.book_copy_uuid 
            LEFT JOIN book_titles bt ON bc.book_title_uuid = bt.book_uuid
            WHERE bc.is_archived = false
            ${instituteUUID ? 'AND bc.institute_uuid = $1' : ''}
          `;
          const totalBorrowedBooks = await this.studentsRepository.query(
            totalBorrowedBooksQuery,
            instituteUUID ? [instituteUUID] : [],
          );
          return totalBorrowedBooks;
        case 'totalmembers':
          const totalMembersQuery = `
          SELECT student_id, email, student_name, date_of_birth, gender, roll_no, institute_name, phone_no, address, department, year_of_admission, image_field, created_at
          FROM students_table 
          WHERE is_archived = false
          ${instituteUUID ? 'AND institute_uuid = $1' : ''}
        `;
          const totalMembers = await this.studentsRepository.query(
            totalMembersQuery,
            instituteUUID ? [instituteUUID] : [],
          );
          return totalMembers;
        case 'newBooks':
          const newBooksQuery = `
            SELECT book_title_id,book_title,book_author,name_of_publisher,place_of_publication,year_of_publication,edition,isbn,no_of_pages,no_of_preliminary, subject,department, call_number, author_mark,title_description, book_copy_id,  source_of_acquisition, date_of_acquisition, bill_no, language, inventory_number, accession_number, barcode, item_type, institute_name, bc.created_at, remarks, copy_description, is_available, ip_address, action, description 
            FROM book_copies bc
            LEFT JOIN book_titles bt ON bc.book_title_uuid = bt.book_uuid
            WHERE bc.is_archived = false 
              AND is_available = true 
              AND bc.created_at >= NOW() - INTERVAL '1 month'
          `;
          return await this.studentsRepository.query(newBooksQuery);
      }
    } catch (error) {
      throw error;
    }
  }

  async createStudentVisitKey(
    user: any,
    latitude: number,
    longitude: number,
    action: string,
  ): Promise<StudentsVisitKey> {
    try {
      const studentKey: StudentsVisitKey[] =
        await this.studentsRepository.query(
          `INSERT INTO student_visit_key (student_id, longitude, latitude, action) VALUES ($1, $2,  $3, $4) RETURNING *`,
          [user.student_id, longitude, latitude, action],
        );
      if (!studentKey.length) {
        throw new HttpException(
          'Failed to create student visit key',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      return studentKey[0];
    } catch (error) {
      console.log(error);
      throw new HttpException(
        `Error: ${error.message || error} while creating student.`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async verifyStudentVisitKey(studentKeyUUID: string) {
    try {
      const lib_longitude = -122.41942;
      const lib_latitude = 37.77491;
      const studentKey = await this.studentsRepository.query(
        `SELECT * FROM student_visit_key WHERE student_key_uuid = $1 AND created_at >= NOW() - INTERVAL '5 minutes' AND is_used = false`,
        [studentKeyUUID],
      );

      if (!studentKey.length) {
        throw new HttpException(
          'Invalid or expired student visit key',
          HttpStatus.BAD_REQUEST,
        );
      }
      const { latitude, longitude, student_id, action } = studentKey[0];

      if (
        isWithin30Meters(
          lib_latitude,
          lib_longitude,
          parseFloat(latitude),
          parseFloat(longitude),
        )
      ) {
        await this.studentsRepository.query(
          `UPDATE student_visit_key SET is_used = true WHERE student_key_uuid = $1`,
          [studentKeyUUID],
        );

        if (action === 'entry') {
          return await this.visitlogentry({ action, student_id });
        } else if (action === 'exit') {
          return await this.visitlogexit({ action, student_id });
        } else {
          throw new HttpException(
            'Invalid action type',
            HttpStatus.BAD_REQUEST,
          );
        }

        // run the entry or exit function based on the action
      } else {
        throw new HttpException(
          'Student visit key is not within the library premises',
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      console.log(error);
      throw new HttpException(
        `Error: ${error.message || error} while creating student.`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async checkVisitKeyStatus(
    studentKeyUUID: string,
  ): Promise<Data<{ status: any }>> {
    try {
      const trial = await this.studentsRepository.query(
        `SELECT * FROM student_visit_key `
      );
      console.log(trial);
      const status: TStudentsVisitkey[] = await this.studentsRepository.query(
        `SELECT * FROM student_visit_key WHERE student_key_uuid = $1 AND created_at >= NOW() - INTERVAL '5 minutes'`,
        [studentKeyUUID],
      );
      if (status.length === 0) {
        throw new HttpException(
          'Invalid or expired student visit key',
          HttpStatus.BAD_REQUEST,
        );
      }
      console.log(status)
      return {
        data: { status: !status[0].is_used },
        pagination: null,
      };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        `Error: ${error.message || error} while creating student.`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
