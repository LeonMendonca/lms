import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, MoreThan, Repository } from 'typeorm';
import { Students, TStudents } from './students.entity';
import { CreateWorker } from 'src/worker-threads/worker-main-thread';
import { Chunkify } from 'src/worker-threads/chunk-array';
import { setTokenFromPayload } from 'utils/jwt/jwt-main';
import { TUpdateResult } from 'src/worker-threads/student/student-archive-worker';
import { isWithinXMeters } from './utilities/location-calculation';
import {
  StudentsVisitKey,
} from './entities/student-visit-key';
import { QueryBuilderService } from 'src/query-builder/query-builder.service';
import { TInsertResult } from 'src/worker-threads/worker-types/student-insert.type';
import { InquireLogs } from './entities/inquire-logs';
import { validateTime } from 'src/misc/validate-time-format';
import {
  DashboardCardtypes,
  StudentCardtypes,
} from 'src/students/types/dashboard';
import { StudentsData } from './entities/student.entity';
import { TCreateStudentDTO } from './dto/student-create.dto';
import { hash } from 'bcryptjs';
import { TEditStudentDTO } from './dto/student-update.dto';
import { TStudentUuidZod } from './dto/student-bulk-delete.dto';
import { TStudentCredDTO } from './dto/student-login.dto';
import { TStudentVisitDTO } from './dto/student-visit.dto';
import { VisitLog } from './entities/visitlog.entity';

export interface DataWithPagination<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface Data<T> {
  data: T;
  pagination: null;
  meta?: any;
}

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Students)
    private studentsRepository: Repository<Students>,

    @InjectRepository(StudentsData)
    private studentsDataRepository: Repository<StudentsData>,

    @InjectRepository(VisitLog)
    private visitLogRepository: Repository<VisitLog>,

    @InjectRepository(StudentsVisitKey)
    private studentsVisitRepository: Repository<StudentsVisitKey>,

    private readonly queryBuilderService: QueryBuilderService,
  ) {}

  async studentLogin(studentCredPayload: TStudentCredDTO): Promise<Data<any>> {
    try {
      const { email, password } = studentCredPayload;

      const student = await this.studentsDataRepository
        .createQueryBuilder('student')
        .where('(student.email = :email OR student.student_id = :email)', {
          email,
        })
        .andWhere('student.password = :password', { password })
        .getOne();

      if (!student) {
        throw new HttpException(
          'Invalid Email or Username',
          HttpStatus.FORBIDDEN,
        );
      }

      const jwtPayloadSelective = {
        studentUuid: student.studentUuid,
        email: student.email,
      };

      return {
        meta: { accessToken: setTokenFromPayload(jwtPayloadSelective) },
        data: {
          ...student,
          institute_image:
            'https://admissionuploads.s3.amazonaws.com/3302d8ef-0a5d-489d-81f9-7b1f689427be_Tia_logo.png',
          institute_header:
            'https://admissionuploads.s3.amazonaws.com/3302d8ef-0a5d-489d-81f9-7b1f689427be_Tia_logo.png',
        },
        pagination: null,
      };
    } catch (error) {
      throw error;
    }
  }

  async createStudent(
    studentPayload: TCreateStudentDTO,
  ): Promise<Data<StudentsData>> {
    try {
      const { mobileNumber, password } = studentPayload;
      const hashedPassword = password
        ? await hash(password, 10)
        : await hash(mobileNumber, 10);

      const newStudent = this.studentsDataRepository.create({
        ...studentPayload,
        password: hashedPassword,
      });

      const savedStudent = await this.studentsDataRepository.save(newStudent);

      return {
        data: savedStudent,
        pagination: null,
      };
    } catch (error) {
      throw new HttpException(
        `Error: ${error.message || error} while creating student.`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAllStudents({
    page,
    limit,
    search,
    asc,
    dec,
    filter,
    institute_uuid,
  }: {
    page: number;
    limit: number;
    asc: string[];
    dec: string[];
    filter: { field: string; value: (string | number)[]; operator: string }[];
    search: { field: string; value: string }[];
    institute_uuid: string[];
  }): Promise<DataWithPagination<StudentsData>> {
    const offset = (page - 1) * limit;

    const queryBuilder =
      this.studentsDataRepository.createQueryBuilder('students_info');

    queryBuilder.andWhere('students_info.isArchived = false');

    if (institute_uuid && institute_uuid.length > 0) {
      queryBuilder.andWhere(
        'students_info.instituteUuid IN (:...institute_uuid)',
        {
          institute_uuid,
        },
      );
    }

    filter.forEach((filterItem) => {
      const { field, value, operator } = filterItem;
      if (operator === 'IN') {
        queryBuilder.andWhere(`students_info.${field} IN (:...${field})`, {
          [field]: value,
        });
      } else {
        queryBuilder.andWhere(`students_info.${field} ${operator} :${field}`, {
          [field]: value,
        });
      }
    });

    search.forEach((searchItem) => {
      const { field, value } = searchItem;
      queryBuilder.andWhere(`students_info.${field} ILIKE :${field}`, {
        [field]: `%${value}%`,
      });
    });

    if (asc.length > 0) {
      asc.forEach((column) => {
        queryBuilder.addOrderBy(`students_info.${column}`, 'ASC');
      });
    }

    if (dec.length > 0) {
      dec.forEach((column) => {
        queryBuilder.addOrderBy(`students_info.${column}`, 'DESC');
      });
    }

    const total = await queryBuilder.getCount();

    const students = await queryBuilder.skip(offset).take(limit).getMany();

    return {
      data: students,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAllDepartments(): Promise<Data<string[]>> {
    try {
      const departments: { department: string }[] =
        await this.studentsDataRepository
          .createQueryBuilder('students_info')
          .select('DISTINCT students_info.department') // Select distinct department
          .where('students_info.isArchived = :isArchived', {
            isArchived: false,
          })
          .getRawMany();

      return {
        data: departments?.map(
          (dept: { department: string }) => dept.department,
        ),
        pagination: null,
      };
    } catch (error) {
      throw error;
    }
  }

  async editStudent(
    studentUuid: string,
    editStudentPayload: TEditStudentDTO,
  ): Promise<Data<StudentsData>> {
    try {
      const existingStudent = await this.studentsDataRepository.findOne({
        where: {
          studentUuid: studentUuid,
          isArchived: false,
        },
      });

      if (!existingStudent) {
        throw new HttpException(
          'Student not found or already archived',
          HttpStatus.NOT_FOUND,
        );
      }

      await this.studentsDataRepository
        .createQueryBuilder()
        .update()
        .set(editStudentPayload)
        .where('studentUuid = :studentUuid', { studentUuid })
        .andWhere('isArchived = false')
        .returning('*')
        .execute();

      const updatedStudent = await this.studentsDataRepository.findOneByOrFail({
        studentUuid: studentUuid,
      });

      return {
        data: updatedStudent,
        pagination: null,
      };
    } catch (error) {
      throw error;
    }
  }

  async findStudentBy(studentUuid: string): Promise<Data<StudentsData>> {
    try {
      const student = await this.studentsDataRepository
        .createQueryBuilder('student_info')
        .where('student.studentUuid = :id', { id: studentUuid })
        .andWhere('student.isArchived = false')
        .getOne();

      if (!student) {
        throw new HttpException('Student not found', HttpStatus.NOT_FOUND);
      }

      return {
        data: student,
        pagination: null,
      };
    } catch (error) {
      throw error;
    }
  }

  async bulkCreate(studentZodValidatedObject: {
    validated_array: TCreateStudentDTO[];
    invalid_data_count: number;
  }): Promise<
    Data<{
      invalid_data: number;
      inserted_data: number;
      duplicate_data_pl: number;
      duplicate_date_db: number;
      unique_data: number;
    }>
  > {
    try {
      const result = await CreateWorker<TInsertResult>(
        studentZodValidatedObject.validated_array,
        'student/student-insert-worker',
      );
      if (typeof result === 'object') {
        const {
          inserted_data,
          duplicate_data_pl,
          duplicate_date_db,
          unique_data,
        } = result;
        return {
          data: {
            invalid_data: studentZodValidatedObject.invalid_data_count,
            inserted_data,
            duplicate_data_pl,
            duplicate_date_db,
            unique_data,
          },
          pagination: null,
        };
      } else {
        throw new HttpException(result, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    } catch (error) {
      throw error;
    }
  }

  async bulkDelete(arrStudentUUIDPayload: {
    validated_array: TStudentUuidZod[];
    invalid_data_count: number;
  }): Promise<
    Data<{
      invalid_data: number;
      archived_data: number;
      failed_archived_data: number;
    }>
  > {
    try {
      const zodValidatedBatchArr: TStudentUuidZod[][] = Chunkify(
        arrStudentUUIDPayload.validated_array,
      );
      const BatchArr: Promise<TUpdateResult>[] = [];
      for (let i = 0; i < zodValidatedBatchArr.length; i++) {
        const result = CreateWorker<TUpdateResult>(
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
        data: {
          invalid_data: arrStudentUUIDPayload.invalid_data_count,
          archived_data,
          failed_archived_data,
        },
        pagination: null,
      };
    } catch (error) {
      throw error;
    }
  }

  // This is in Raw SQL because converting it to SQL would be difficult
  async adminDashboard(
    instituteUuid: string | null,
  ): Promise<Data<DashboardCardtypes>> {
    try {
      if (!instituteUuid) {
        throw new HttpException(
          'Please Provide atleast one Institute Identifier',
          HttpStatus.BAD_REQUEST,
        );
      }

      const instituteUUIDsJSON = JSON.parse(instituteUuid || '[]') as string[];
      const useInstituteFilter =
        Array.isArray(instituteUUIDsJSON) && instituteUUIDsJSON.length > 0;

      const whereInstituteClause = useInstituteFilter
        ? `AND instituteUuid = ANY($1)`
        : '';

      const instituteParams = useInstituteFilter ? [instituteUUIDsJSON] : [];

      const totalBooksQuery = `
        SELECT COUNT(*) 
          FROM book_copies 
          WHERE is_archived = false
          ${whereInstituteClause}
        `;

      const totalBooks: { count: string }[] =
        await this.studentsDataRepository.query(
          totalBooksQuery,
          instituteParams,
        );

      const totalBorrowedBooksQuery = `
        SELECT COUNT(*) 
          FROM book_logv2 
          LEFT JOIN book_copies ON book_logv2.book_copy_uuid = book_copies.book_copy_uuid 
          WHERE book_copies.is_archived = false
          ${whereInstituteClause.replace('institute_uuid', 'book_copies.institute_uuid')}
        `;

      const totalBorrowedBooks = await this.studentsDataRepository.query(
        totalBorrowedBooksQuery,
        instituteParams,
      );

      const totalMembersQuery = `
      SELECT COUNT(*) 
        FROM studentUuid 
        WHERE isArchived = false
        ${whereInstituteClause}
      `;

      const totalMembers = await this.studentsDataRepository.query(
        totalMembersQuery,
        instituteParams,
      );

      const newBooksQuery = `
        SELECT COUNT(*) 
          FROM book_copies 
          WHERE is_archived = false 
            AND is_available = true 
            AND created_at >= NOW() - INTERVAL '1 month'
        `;
      const newBooks = await this.studentsDataRepository.query(newBooksQuery);

      const todayIssuesQuery = `
        SELECT COUNT(*) 
          FROM book_logv2 
          WHERE date >= CURRENT_DATE AND action = 'borrowed'
        `;
      const todayIssues =
        await this.studentsDataRepository.query(todayIssuesQuery);

      const todayReturnedQuery = `
        SELECT COUNT(*) 
          FROM book_logv2 
          WHERE date >= CURRENT_DATE AND action = 'returned'
        `;
      const todayReturned =
        await this.studentsDataRepository.query(todayReturnedQuery);

      const overdueQuery = `
        SELECT COUNT(*) 
          FROM fees_penalties 
          WHERE penalty_amount > 0
        `;
      const overdues = await this.studentsDataRepository.query(overdueQuery);

      const trendingQuery = `
        SELECT COUNT(*) 
        FROM book_copies 
        WHERE is_archived = false 
          AND is_available = true 
          AND created_at >= NOW() - INTERVAL '1 month'
      `;
      const trending = await this.studentsDataRepository.query(trendingQuery);

      const parseCount = (result: { count: string }[]) =>
        parseInt(result?.[0]?.count || '0', 10);

      return {
        data: {
          totalBooks: parseCount(totalBooks),
          totalBorrowedBooks: parseCount(totalBorrowedBooks),
          totalMembers: parseCount(totalMembers),
          newBooks: parseCount(newBooks),
          todayIssues: parseCount(todayIssues),
          todayReturned: parseCount(todayReturned),
          overdue: parseCount(overdues),
          trending: parseCount(trending),
        },
        pagination: null,
      };
    } catch (error) {
      throw error;
    }
  }

  async studentDashboard(user: string): Promise<Data<StudentCardtypes>> {
    try {
      const student = await this.studentsDataRepository.query(
        `SELECT studentUuid FROM students_info WHERE studentUuid = $1`,
        [user],
      );

      const totalBooks = await this.studentsDataRepository.query(
        `SELECT COUNT(*) FROM book_titles WHERE is_archived = false`,
      );

      const newBooks = await this.studentsDataRepository.query(
        `SELECT COUNT(*) FROM book_titles WHERE is_archived = false AND created_at >= NOW() - INTERVAL '1 month'`,
      );
      const yearlyBorrow = await this.studentsDataRepository.query(
        `SELECT COUNT(*) FROM book_logv2 WHERE borrower_uuid = $1 AND date >= DATE_TRUNC('year', NOW()) + INTERVAL '5 months' - INTERVAL '1 year'
          AND date < DATE_TRUNC('year', NOW()) + INTERVAL '5 months'`,
        [student[0].student_uuid],
      );
      const totalBorrowedBooks = await this.studentsDataRepository.query(
        `SELECT COUNT(*) FROM fees_penalties WHERE is_completed = false AND borrower_uuid = $1 `,
        [student[0].student_uuid],
      );

      return {
        data: {
          totalBooks: totalBooks[0].count,
          newBooks: newBooks[0].count,
          yearlyBorrow: yearlyBorrow[0].count,
          totalBorrowedBooks: totalBorrowedBooks[0].count,
        },
        pagination: null,
      };
    } catch (error) {
      throw error;
    }
  }

  async createStudentVisitKey(
    studentUuid: string,
    latitude: number,
    longitude: number,
  ): Promise<Data<StudentsVisitKey>> {
    try {
      const studentKey = this.studentsVisitRepository.create({
        studentUuid,
        longitude,
        latitude,
      });

      const result = await this.studentsVisitRepository.save(studentKey);

      return {
        data: result,
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

  async visitlogentry({
    studentUuid,
  }: TStudentVisitDTO): Promise<Data<VisitLog>> {
    try {
      const student = await this.studentsDataRepository.findOne({
        where: { studentUuid },
      });

      if (!student) {
        throw new HttpException('Invalid student ID', HttpStatus.BAD_REQUEST);
      }

      const lastEntry = await this.visitLogRepository.findOne({
        where: { studentUuid },
        order: { inTime: 'DESC' },
      });

      if (lastEntry && lastEntry.action === 'entry' && !lastEntry.outTime) {
        throw new HttpException(
          'Previous entry not exited. Exit required before new entry.',
          HttpStatus.BAD_REQUEST,
        );
      }

      const newVisitLog = this.visitLogRepository.create({
        studentUuid,
        studentName: `${student.firstName} ${student.lastName}`,
        department: student.department,
        action: 'entry',
        inTime: new Date(),
        instituteUuid: student.instituteUuid,
        instituteName: student.instituteName,
      });

      const data = await this.visitLogRepository.save(newVisitLog);

      return {
        data,
        pagination: null,
        meta: { message: 'Entry Log' },
      };
    } catch (error) {
      throw new HttpException(
        `Error: ${error.message || error} while processing visit log entry.`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async visitlogexit({
    studentUuid,
  }: TStudentVisitDTO): Promise<Data<VisitLog>> {
    try {
      const student = await this.studentsDataRepository.findOne({
        where: { studentUuid: studentUuid },
      });

      if (!student) {
        throw new HttpException('Invalid student ID', HttpStatus.BAD_REQUEST);
      }

      const lastEntry = await this.visitLogRepository.findOne({
        where: {
          studentUuid,
          action: 'entry',
          outTime: IsNull(),
        },
        order: { inTime: 'DESC' },
      });

      if (!lastEntry) {
        throw new HttpException(
          'No open entry log found. A valid entry is required before exit.',
          HttpStatus.BAD_REQUEST,
        );
      }

      lastEntry.outTime = new Date();
      lastEntry.action = 'exit';
      const data = await this.visitLogRepository.save(lastEntry);

      return {
        data,
        pagination: null,
        meta: { message: 'Exit Log' },
      };
    } catch (error) {
      throw new HttpException(
        `Error: ${error.message || error} while processing visit log exit.`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async verifyStudentVisitKey(studentKeyUuid: string): Promise<Data<VisitLog>> {
    try {
      const lib_longitude = 72.8645;
      const lib_latitude = 19.2135;

      const studentKey = await this.studentsVisitRepository.findOne({
        where: {
          studentKeyUuid,
          isUsed: false,
          createdAt: MoreThan(new Date(Date.now() - 3 * 60 * 1000)), // 3 minutes ago
        },
      });

      if (!studentKey) {
        throw new HttpException(
          'Invalid or expired student visit key',
          HttpStatus.BAD_REQUEST,
        );
      }

      const { latitude, longitude, studentUuid } = studentKey;

      if (
        isWithinXMeters(lib_latitude, lib_longitude, latitude, longitude, 30)
      ) {
        try {
          const data = await this.visitlogentry({ studentUuid });
          studentKey.action = 'entry';
          await this.studentsVisitRepository.save(studentKey);
          return data;
        } catch (error) {
          if (error?.message.includes('Previous entry not exited')) {
            const data = await this.visitlogexit({ studentUuid });
            studentKey.action = 'exit';
            await this.studentsVisitRepository.save(studentKey);
            return data;
          } else {
            throw new HttpException(
              'Invalid action type',
              HttpStatus.BAD_REQUEST,
            );
          }
        }
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
    studentKeyUuid: string,
  ): Promise<Data<{ status: boolean }>> {
    try {
      const status = await this.studentsVisitRepository.findOne({
        where: {
          studentKeyUuid,
          createdAt: MoreThan(new Date(Date.now() - 3 * 60 * 1000)),
        },
      });
      if (!status) {
        throw new HttpException(
          'Invalid or expired student visit key',
          HttpStatus.BAD_REQUEST,
        );
      }
      return {
        data: { status: !status.isUsed },
        pagination: null,
        meta: { action: status.action },
      };
    } catch (error) {
      throw new HttpException(
        `Error: ${error.message || error} while creating student.`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // visit log
  async getCompleteVisitLog(
    {
      page,
      limit,
      fromDate,
      toDate,
      fromTime,
      toTime,
    }: {
      page: number;
      limit: number;
      fromDate: string | undefined;
      toDate: string | undefined;
      fromTime: string | undefined;
      toTime: string | undefined;
    } = {
      page: 1,
      limit: 10,
      fromDate: undefined,
      toDate: undefined,
      fromTime: undefined,
      toTime: undefined,
    },
  ) {
    try {
      const offset = (page - 1) * limit;

      let fromDateObj: Date | undefined = undefined;
      let toDateObj: Date | undefined = undefined;

      //Mark both time as undefined if either is not valid
      if (
        fromTime &&
        toTime &&
        (!validateTime(fromTime) || !validateTime(toTime))
      ) {
        fromTime = undefined;
        toTime = undefined;
      }

      if (fromDate && toDate) {
        fromDateObj = new Date(fromDate);
        toDateObj = new Date(toDate);

        if (fromDateObj > toDateObj) {
          throw new HttpException(
            'From date cannot be greater than To date',
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      let queryDateAndTime = '';

      if (fromDateObj && toDateObj) {
        queryDateAndTime += `AND in_time BETWEEN '${fromDateObj.toISOString().split('T')[0]}' AND '${toDateObj.toISOString().split('T')[0]}' `;
      }

      if (fromTime && toTime) {
        queryDateAndTime += `
        AND CAST(in_time AS TIME) BETWEEN '${fromTime}' AND '${toTime}' OR CAST(out_time AS TIME) BETWEEN '${fromTime}' AND '${toTime}'
        `;
      }

      // Optimized SQL Query with Pagination at Database Level
      const logs = await this.studentsRepository.query(
        `
        SELECT visitlog_id, department, student_id, in_time, out_time, visitor_name AS visitor FROM visit_log WHERE 0=0 ${queryDateAndTime}
        ORDER BY in_time DESC
        LIMIT $1 OFFSET $2
        `,
        [limit, offset],
      );

      // Fetch total count (for pagination)
      const total = await this.studentsRepository.query(
        `
        SELECT COUNT(*) FROM visit_log
        `,
      );

      const totalCount = parseInt(total[0].count, 10);

      // console.log({ totalCount, logs });

      return {
        data: logs,
        pagination: {
          total: totalCount ?? 0,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit) ?? 0,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async getVisitAllLog({
    page,
    limit,
    search,
    asc,
    dec,
    filter,
    institute_uuid,
  }: {
    page: number;
    limit: number;
    asc: string[];
    dec: string[];
    filter: { field: string; value: (string | number)[]; operator: string }[];
    search: { field: string; value: string }[];
    institute_uuid: string[];
  }) {
    try {
      const offset = (page - 1) * limit;

      const params: (string | number)[] = [];

      filter.push({
        field: 'institute_uuid',
        value: institute_uuid,
        operator: '=',
      });

      const whereClauses = this.queryBuilderService.buildWhereClauses(
        filter,
        search,
        params,
      );
      const orderByQuery = this.queryBuilderService.buildOrderByClauses(
        asc,
        (dec = ['log_date']),
      );

      // Optimized SQL Query with Pagination at Database Level
      const logs = await this.studentsRepository.query(
        `
        SELECT * FROM (
          SELECT institute_uuid, visitlog_id AS id, student_id As student_id, NULL AS book_copy, NULL AS book_title, action AS action, NULL AS description, NULL AS ip_address, out_time AS out_time, visitor_name AS visitor, in_time AS log_date, in_time AS timestamp FROM visit_log
          UNION ALL
          SELECT bl.institute_uuid ,  bl.booklog_uuid AS id, st.student_id AS student_id, bl.new_book_copy AS book_copy, bl.new_book_title AS book_title, bl.action AS action, bl.description AS description, bl.ip_address AS ip_address,  NULL AS out_time, st.student_name AS visitor,  date AS log_date, time AS timestamp FROM book_logv2 bl LEFT JOIN students_table st ON st.student_uuid = bl.borrower_uuid
        ) AS combined_logs
        ${whereClauses} ${orderByQuery}
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
        `,
        [...params, limit, offset],
      );

      // Fetch total count (for pagination)
      const total = await this.studentsRepository.query(
        `
        SELECT COUNT(*) AS total FROM (
          SELECT institute_uuid, visitlog_id AS id FROM visit_log
          UNION ALL
          SELECT institute_uuid,  booklog_uuid AS id  FROM book_logv2 
        ) AS combined_logs ${whereClauses}
        `,
        params,
      );

      console.log('Total is', total);

      const totalCount = parseInt(total[0].total, 10);

      return {
        data: logs,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
        },
      };
    } catch (error) {
      throw new HttpException(
        `Error: ${error.message || error}, something went wrong in fetching all logs!`,
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
      const visitLogs = await this.studentsRepository.query(
        `
          SELECT * FROM (
            SELECT visitlog_id AS id, student_id As student_id, NULL AS book_copy, NULL AS book_title, action AS action, NULL AS description, NULL AS ip_address, out_time AS out_time, in_time AS log_date FROM visit_log WHERE student_uuid = $1
            UNION ALL
            SELECT  bl.booklog_uuid AS id, st.student_id AS student_id, bl.new_book_copy AS book_copy, bl.new_book_title AS book_title, bl.action AS action, bl.description AS description, bl.ip_address AS ip_address, NULL AS out_time,  date AS log_date FROM book_logv2 bl LEFT JOIN students_table st ON st.student_uuid = bl.borrower_uuid  WHERE borrower_uuid = $1
          ) AS combined_logs
          ORDER BY log_date DESC
          LIMIT $2 OFFSET $3
        `,
        [student_id, limit, offset],
      );
      console.log(visitLogs);
      const totalResult = await this.studentsRepository.query(
        `SELECT COUNT(*) FROM (
            SELECT visitlog_id AS id, student_id As student_id, NULL AS book_copy, NULL AS book_title, action AS action, NULL AS description, NULL AS ip_address, out_time AS out_time, in_time AS log_date FROM visit_log WHERE student_uuid = $1
            UNION ALL
            SELECT  bl.booklog_uuid AS id, st.student_id AS student_id, bl.new_book_copy AS book_copy, bl.new_book_title AS book_title, bl.action AS action, bl.description AS description, bl.ip_address AS ip_address, NULL AS out_time,  date AS log_date FROM book_logv2 bl LEFT JOIN students_table st ON st.student_uuid = bl.borrower_uuid  WHERE borrower_uuid = $1
          ) AS combined_logs2`,
        [student_id],
      );
      if (visitLogs.length === 0) {
        throw new HttpException('no log data found', HttpStatus.NOT_FOUND);
      }
      return {
        data: visitLogs,
        pagination: {
          total: parseInt(totalResult[0].count, 10),
          page,
          limit,
          totalPages: Math.ceil(parseInt(totalResult[0].count, 10) / limit),
        },
      };
    } catch (error) {
      throw new HttpException(
        `Error: ${error.message} - Invalid student_id`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async reportInquiryLog({
    student,
    type,
    inquiryUuid,
  }: {
    student: any;
    type: string;
    inquiryUuid: string;
  }): Promise<Data<InquireLogs>> {
    try {
      const result: InquireLogs[] = await this.studentsRepository.query(
        `INSERT INTO inquire_logs (student_uuid, inquiry_type, inquiry_uuid) VALUES ($1, $2, $3) RETURNING *`,
        [student.student_uuid, type, inquiryUuid],
      );

      if (!result.length) {
        throw new HttpException(
          'Failed to create visit log entry',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return {
        data: result[0],
        pagination: null,
      };
    } catch (error) {
      throw new HttpException(
        `Error: ${error.message || error} while processing visit log entry.`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async inquiryLogAction({
    type,
    report_uuid,
  }: {
    type: string;
    report_uuid: string;
  }): Promise<Data<{ success: boolean }>> {
    try {
      switch (type) {
        case 'approve':
          await this.studentsRepository.query(
            `UPDATE inquire_logs SET is_resolved = true WHERE report_uuid = $1`,
            [report_uuid],
          );
          break;
        case 'reject':
          await this.studentsRepository.query(
            `UPDATE inquire_logs SET is_archived = true WHERE report_uuid = $1`,
            [report_uuid],
          );
          break;
      }
      const meta: TStudents[] = await this.studentsRepository.query(
        `SELECT inquiry_type, student_uuid FROM inquire_logs  WHERE report_uuid = $1`,
        [report_uuid],
      );
      return {
        data: { success: true },
        pagination: null,
        meta: meta[0],
      };
    } catch (error) {
      throw new HttpException(
        `Error: ${error.message || error} while processing visit log entry.`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getInquiryLogByStudentUUID({
    student_uuid,
    page,
    limit,
  }: {
    student_uuid: string;
    page: number;
    limit: number;
  }) {
    try {
      const offset = (page - 1) * limit;
      const inquiryLogs = await this.studentsRepository.query(
        `SELECT * FROM inquire_logs WHERE student_uuid = $1 AND is_archived = false ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
        [student_uuid, limit, offset],
      );

      const total = await this.studentsRepository.query(
        `SELECT * FROM inquire_logs WHERE student_uuid = $1 AND is_archived = false `,
        [student_uuid],
      );

      if (inquiryLogs.length === 0) {
        throw new HttpException(
          'No inquiry log data found',
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        data: inquiryLogs,
        pagination: {
          total: total.length,
          page,
          limit,
          totalPages: Math.ceil(total.length / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async getAllInquiry({ page, limit }: { page: number; limit: number }) {
    try {
      const offset = (page - 1) * limit;
      const inquiryLogs = await this.studentsRepository.query(
        `SELECT * FROM inquire_logs WHERE is_archived = false ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
        [limit, offset],
      );

      const total = await this.studentsRepository.query(
        `SELECT * FROM inquire_logs WHERE is_archived = false `,
      );

      if (inquiryLogs.length === 0) {
        throw new HttpException(
          'No inquiry log data found',
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        data: inquiryLogs,
        pagination: {
          total: total.length,
          page,
          limit,
          totalPages: Math.ceil(total.length / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async studentProfile(student_id: string) {
    try {
      const result = await this.studentsRepository.query(
        `SELECT student_uuid, student_name, department, email, roll_no, year_of_admission, phone_no, address FROM students_table WHERE student_id= $1`,
        [student_id],
      );
      if (result.length === 0) {
        throw new HttpException(
          'invalid Student ID !!',
          HttpStatus.BAD_REQUEST,
        );
      }

      const reviews = await this.studentsRepository.query(
        `SELECT * FROM reviews WHERE student_uuid = '${result[0].student_uuid}' AND is_archived = false`,
      );
      return { ...result[0], reviews };
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
            SELECT book_title_id,book_title,book_author,name_of_publisher,place_of_publication,year_of_publication,edition,isbn,no_of_pages,no_of_preliminary, subject,department, call_number, author_mark,title_description, book_copy_id,  source_of_acquisition, date_of_acquisition, bill_no, language, inventory_number, accession_number, barcode, item_type, institute_name, bc.created_at, remarks, copy_description, is_available 
            FROM book_copies bc
            LEFT JOIN book_titles bt ON bc.book_title_uuid = bt.book_uuid
            WHERE bc.is_archived = false 
              AND is_available = true 
              AND bc.created_at >= NOW() - INTERVAL '1 month'
          `;
          return await this.studentsRepository.query(newBooksQuery);
        case 'todayIssues':
          const todayIssuesQuery = `
          SELECT book_title_id,book_title,book_author,name_of_publisher,place_of_publication,year_of_publication,edition,isbn,no_of_pages,no_of_preliminary, subject,department, call_number, author_mark,title_description, book_copy_id,  source_of_acquisition, date_of_acquisition, bill_no, language, inventory_number, accession_number, barcode, item_type, institute_name, bc.created_at, remarks, copy_description, is_available 
          FROM book_logv2 bl
          LEFT JOIN book_copies bc ON bl.book_copy_uuid = bc.book_copy_uuid 
          LEFT JOIN book_titles bt ON bc.book_title_uuid = bt.book_uuid
          WHERE date >= CURRENT_DATE AND action = 'borrowed'
        `;
          return await this.studentsRepository.query(todayIssuesQuery);
        case 'todayReturned':
          const todayReturnedQuery = ` 
          SELECT book_title_id,book_title,book_author,name_of_publisher,place_of_publication,year_of_publication,edition,isbn,no_of_pages,no_of_preliminary, subject,department, call_number, author_mark,title_description, book_copy_id,  source_of_acquisition, date_of_acquisition, bill_no, language, inventory_number, accession_number, barcode, item_type, institute_name, bc.created_at, remarks, copy_description, is_available 
          FROM book_logv2 bl
          LEFT JOIN book_copies bc ON bl.book_copy_uuid = bc.book_copy_uuid 
          LEFT JOIN book_titles bt ON bc.book_title_uuid = bt.book_uuid
          WHERE date >= CURRENT_DATE AND action = 'returned'
          `;
          return await this.studentsRepository.query(todayReturnedQuery);
        case 'overdue':
          const overdueQuery = `
          SELECT fp.*, book_title_id,book_title,book_author,name_of_publisher,place_of_publication,year_of_publication,edition,isbn,no_of_pages,no_of_preliminary, subject,bt.department, call_number, author_mark,title_description, book_copy_id,  source_of_acquisition, date_of_acquisition, bill_no, language, inventory_number, accession_number, barcode, item_type, bc.institute_name, bc.created_at, remarks, copy_description, is_available, st.student_id, st.email, st.student_name, st.date_of_birth, st.gender, st.roll_no, st.institute_name, st.phone_no, st.address, st.department AS student_department, st.year_of_admission   FROM fees_penalties fp LEFT JOIN book_copies bc ON fp.copy_uuid = bc.book_copy_uuid LEFT JOIN book_titles bt ON bc.book_title_uuid = bt.book_uuid LEFT JOIN students_table st ON fp.borrower_uuid = st.student_uuid
          WHERE penalty_amount > 0`;
          return await this.studentsRepository.query(overdueQuery);
      }
    } catch (error) {
      throw error;
    }
  }
}
