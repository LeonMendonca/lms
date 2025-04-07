import { HttpException, HttpStatus, Injectable, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeesPenalties } from './entity/fees-penalties.entity';
import { TUpdateFeesPenaltiesZod } from 'src/books_v2/zod/update-fp-zod';
import { JournalCopy } from 'src/journals/entity/journals_copy.entity';
import { JournalLogs } from 'src/journals/entity/journals_log.entity';
import { JournalTitle } from 'src/journals/entity/journals_title.entity';
import { student, Students } from 'src/students/students.entity';
import { TCreatePenaltyZod } from './zod/create-penalty-zod';
import { chownSync } from 'fs';

@Injectable()
export class FeesPenaltiesService {

    constructor(
        @InjectRepository(FeesPenalties)
        private feesPenaltiesRepository: Repository<FeesPenalties>,

        @InjectRepository(JournalLogs)
        private journalLogRepository: Repository<JournalLogs>,

        @InjectRepository(JournalCopy)
        private journalsCopyRepository: Repository<JournalCopy>,

        @InjectRepository(JournalTitle)
        private journalsTitleRepository: Repository<JournalTitle>,

        @InjectRepository(Students)
        private studentsRepository: Repository<Students>,

    ) { }

    async getStudentFee({ studentId, isPenalty, isCompleted }: { studentId: string, isPenalty?: boolean, isCompleted?: boolean }) {
        try {
            // If no parameters are provided, return a message
            if (!studentId && !isPenalty && !isCompleted) {
                return { message: "Provide at least one parameter for searching" };
            }

            // Construct WHERE conditions dynamically
            let query = `SELECT * FROM fees_penalties WHERE 1=1`; // 1=1 makes it easier to append conditions
            const params: any[] = [];

            if (studentId) {
                query += ` AND borrower_uuid = $${params.length + 1}`;
                params.push(studentId);
            }
            if (isPenalty !== undefined) {
                query += ` AND is_penalised = $${params.length + 1}`;
                params.push(isPenalty);
            }
            if (isCompleted !== undefined) {
                query += ` AND is_completed = $${params.length + 1}`;
                params.push(isCompleted);
            }

            // Execute the query
            const penalties = await this.feesPenaltiesRepository.query(query, params);

            if (penalties.length) {
                return { penalties };
            } else {
                return { message: "No Penalty Found" };
            }
        } catch (error) {
            return { error: error.message || "An error occurred" };
        }
    }


    // async getStudentFee(
    //     student_id: string,
    //     isPenalty: boolean,
    //     isCompleted: boolean,
    // ) {
    //     try {
    //         if (student_id) {
    //             const result: { student_uuid: string }[] =
    //                 await this.studentsRepository.query(
    //                     `SELECT student_uuid FROM students_table WHERE student_id=$1`,
    //                     [student_id],
    //                 );
    //             if (result.length === 0) {
    //                 throw new HttpException(
    //                     { message: 'Invaid Student ID !!' },
    //                     HttpStatus.ACCEPTED,
    //                 );
    //             }
    //             const data = await this.feesPenaltiesRepository.query(
    //                 `SELECT * FROM fees_penalties WHERE borrower_uuid=$1 and is_penalised=$2 or is_completed= $3`,
    //                 [result[0].student_uuid, isPenalty, isCompleted],
    //             );
    //             if (data.length === 0) {
    //                 throw new HttpException(
    //                     { message: 'No Penalties are There!!' },
    //                     HttpStatus.ACCEPTED,
    //                 );
    //             }
    //             return data;
    //         }
    //         //00008-Tech University-2025
    //         else if (isPenalty) {
    //             const data = await this.feesPenaltiesRepository.query(
    //                 `SELECT * FROM fees_penalties WHERE is_penalised=$1`,
    //                 [isPenalty],
    //             );
    //             if (data.length === 0) {
    //                 throw new HttpException(
    //                     { message: 'No Penalties are Found!!' },
    //                     HttpStatus.ACCEPTED,
    //                 );
    //             }
    //             return data;
    //         } else if (isCompleted) {
    //             const data = await this.feesPenaltiesRepository.query(
    //                 `SELECT * FROM fees_penalties WHERE is_completed=$1`,
    //                 [isCompleted],
    //             );
    //             if (data.length === 0) {
    //                 throw new HttpException(
    //                     { message: 'No data are Found!!' },
    //                     HttpStatus.ACCEPTED,
    //                 );
    //             }
    //             return data;
    //         }
    //     } catch (error) {
    //         throw error;
    //     }
    // }


    async getFullFeeList({ page, limit }: { page: number; limit: number } = {
        page: 1,
        limit: 10,
      }) {
        try {
          const offset = (page - 1) * limit;
      
          const result = await this.journalsTitleRepository.query(
            `
            SELECT 
              st.student_id AS "student_id",
              st.student_name AS "student_name",
              st.department AS "department",
              jc.journal_copy_id AS "id",
              jt.category AS "category",
              fp.penalty_amount,
              fp.paid_amount,
              fp.is_penalised,
              fp.is_completed,
              fp.created_at AS "created_id",
              fp.return_date
            FROM fees_penalties fp
            INNER JOIN students_table st ON st.student_uuid = fp.borrower_uuid
            INNER JOIN journal_copy jc ON jc.journal_copy_uuid = fp.copy_uuid
            INNER JOIN journal_titles jt ON jt.journal_uuid = jc.journal_title_uuid
            WHERE st.is_archived = false AND jc.is_archived = false
            LIMIT $1 OFFSET $2
            `,
            [limit, offset]
          );
      
          const total = await this.journalsTitleRepository.query(
            `
            SELECT COUNT(*) as count
            FROM fees_penalties fp
            INNER JOIN students_table st ON st.student_uuid = fp.borrower_uuid
            INNER JOIN journal_copy jc ON jc.journal_copy_uuid = fp.copy_uuid
            INNER JOIN journal_titles jt ON jt.journal_uuid = jc.journal_title_uuid
            WHERE st.is_archived = false AND jc.is_archived = false
            `
          );
      
          if (result.length === 0) {
            throw new HttpException(
              { message: 'No data found!!' },
              HttpStatus.ACCEPTED,
            );
          }
      
          return {
            data: result,
            pagination: {
              page,
              limit,
              total: parseInt(total[0].count, 10),
              totalPage: Math.ceil(parseInt(total[0].count, 10) / limit)
            }
          };
        } catch (error) {
          throw error;
        }
      }
      
    async getFullFeeListStudentBooks(student_id: string) {
        try {
            if (!student_id) {
                return { message: "Enter Student Id" }
            }
            if (student_id.length === 0) {
                return { message: "Enter Student Id" }
            }
            const result = await this.journalsTitleRepository.query(
                `SELECT 
                    students_table.student_id,
                    book_copies.book_copy_id,
                    students_table.student_name, 
                    students_table.department,
                    book_titles.subject, 
                    fees_penalties.return_date, 
                    fees_penalties.created_at, 
                    fees_penalties.penalty_amount 
                FROM fees_penalties
                INNER JOIN students_table 
                    ON fees_penalties.borrower_uuid = students_table.student_uuid 
                INNER JOIN book_copies 
                    ON fees_penalties.book_copy_uuid = book_copies.book_copy_uuid
                INNER JOIN book_titles 
                    ON book_titles.book_uuid = book_copies.book_title_uuid
                WHERE students_table.student_id = $1`,
                [student_id]
            );
            if (result.length === 0) {
                throw new HttpException(
                    { message: 'No data found!!' },
                    HttpStatus.ACCEPTED,
                );
            }
            return result;
        } catch (error) {
            return { error: error }
        }
    }


    async getFullFeeListStudentPeriodicals(student_id: string) {
        try {
            if (!student_id) {
                return { message: "Enter Student Id" }
            }
            if (student_id.length === 0) {
                return { message: "Enter Student Id" }
            }
            // journal_titles.return_date,
            // journal_titles.subject, 
            const result = await this.journalsTitleRepository.query(
                `SELECT 
                    students_table.student_id,
                    journal_copy.journal_copy_id,
                    students_table.student_name, 
                    students_table.department,
                    fees_penalties.return_date, 
                    fees_penalties.created_at, 
                    fees_penalties.penalty_amount 
                FROM fees_penalties
                INNER JOIN students_table 
                    ON fees_penalties.borrower_uuid = students_table.student_uuid 
                INNER JOIN journal_copy 
                    ON fees_penalties.copy_uuid = journal_copy.journal_copy_uuid
                INNER JOIN journal_titles 
                    ON journal_titles.journal_uuid = journal_copy.journal_title_uuid
                WHERE students_table.student_id = $1`,
                [student_id]
            )
            if (result.length === 0) {
                throw new HttpException(
                    { message: 'No data found!!' },
                    HttpStatus.ACCEPTED,
                );
            }
            return result;
        } catch (error) {
            throw error
        }
    }


    // async getFullFeeListStudent() {
    //     try {
    //         const result = await this.journalsTitleRepository
    //             .query(`SELECT students_table.student_id,
    //                 book_copies.book_copy_id,
    //                 students_table.student_name, 
    //                 students_table.department,
    //                 book_titles.subject, 
    //                 fees_penalties.return_date, 
    //                 fees_penalties.created_at, 
    //                 fees_penalties.penalty_amount FROM fees_penalties
    //                 INNER JOIN students_table ON fees_penalties.borrower_uuid=students_table.student_uuid 
    //                 INNER JOIN  book_copies ON fees_penalties.book_copy_uuid=book_copies.book_copy_uuid
    //                 INNER JOIN book_titles ON book_titles.book_uuid= book_copies.book_title_uuid`);

    //         console.log(result)
    //         if (result.length === 0) {
    //             throw new HttpException(
    //                 { message: 'No data found!!' },
    //                 HttpStatus.ACCEPTED,
    //             );
    //         }
    //         return result;
    //     } catch (error) {
    //         throw error;
    //     }
    // }

    async generateFeeReport(start: Date, end: Date, page: number, limit: number) {
        try {
            const offset = (page - 1) * limit;

            const result = await this.journalsTitleRepository.query(
                `SELECT * FROM fees_penalties WHERE updated_at BETWEEN $1 AND $2 LIMIT $3 OFFSET $4 ;`,
                [start, end, limit, offset],
            );
            const total = await this.journalsTitleRepository.query(
                `SELECT count (*) FROM fees_penalties WHERE updated_at BETWEEN $1 AND $2 ;`,
                [start, end],
            );
            if (result.length === 0) {
                throw new HttpException(
                    { message: 'No data found!!' },
                    HttpStatus.ACCEPTED,
                );

            }
            return {
                data: result,
                pagination: {
                    total: parseInt(total[0].count, 10),
                    page,
                    limit,
                    totalPages: Math.ceil(parseInt(total[0].count, 10) / limit),
                },
            };
            //  console.log(result);
        } catch (error) {
            throw error;
        }
    }


    async payStudentFee(updateFeesPayload: TUpdateFeesPenaltiesZod) {
        try {
            const studentAndBookCopiesPayloadWithFeesPenalties: {
                student_uuid: string;
                book_copy_uuid: string;
                penalty_amount: number;
                return_date: Date;
                returned_at: Date;
                paid_amount: number;
                is_penalised: boolean;
                is_completed: boolean;
            }[] = await this.studentsRepository.query(
                `SELECT student_uuid, 
                book_copies.book_copy_uuid, 
                penalty_amount, return_date, 
                returned_at, paid_amount, 
                is_penalised, 
                is_completed 
                FROM fees_penalties 
                INNER JOIN students_table ON fees_penalties.borrower_uuid = students_table.student_uuid 
                INNER JOIN book_copies ON fees_penalties.copy_uuid = book_copies.book_copy_uuid 
                WHERE students_table.is_archived = FALSE
                AND students_table.student_id = $1 
                AND book_copies.is_archived = FALSE
                AND book_copies.book_copy_id = $2 
                AND penalty_amount > paid_amount
                AND is_completed = FALSE
                AND is_penalised = TRUE
                AND returned_at IS NOT NULL`,
                [updateFeesPayload.student_id, updateFeesPayload.copy_id],
            );

            if (!studentAndBookCopiesPayloadWithFeesPenalties.length) {
                throw new HttpException(
                    'Cannot find Student or Book, maybe archived or No penalty or Not returned',
                    HttpStatus.BAD_REQUEST,
                );
            }

            // Extract necessary values
            const record = studentAndBookCopiesPayloadWithFeesPenalties[0];

            // Accumulate total paid amount
            const accumulatedPaidAmount = updateFeesPayload.paid_amount + record.paid_amount;

            // Determine if penalty is cleared
            const isPenalised = accumulatedPaidAmount < record.penalty_amount; // True if penalty remains
            const isCompleted = !isPenalised; // True if penalty is fully paid

            // FIX: Add WHERE clause to prevent updating all records
            await this.feesPenaltiesRepository.query(
                `UPDATE fees_penalties 
                 SET payment_method = $1, paid_amount = $2, is_penalised = $3, is_completed = $4
                 WHERE student_uuid = $5 AND book_copy_uuid = $6`,
                [
                    updateFeesPayload.payment_method,
                    accumulatedPaidAmount,
                    true,
                    isCompleted,
                    record.student_uuid,
                    record.book_copy_uuid
                ],
            );

            return {
                statusCode: HttpStatus.OK,
                message: 'Penalty paid successfully!',
            };
        } catch (error) {
            throw error;
        }
    }


    // async payStudentFee(updateFeesPayload: TUpdateFeesPenaltiesZod){
    //     try{

    //         const data = await this.journalsCopyRepository.query(
    //             `SELECT journal_copy_uuid FROM journal_copy WHERE journal_copy_id = $1`,
    //         [updateFeesPayload.copy_id]
    //         )
    //         const journal_copy_uuid = data[0].journal_copy_uuid

    //         const studentAndJournalCopiesPayloadWithFeesPenalties:{
    //             student_uuid: string;
    //             copy_uuid: string;
    //             penalty_amount: number;
    //             return_date: Date;
    //             returned_at: Date;
    //             paid_amount: number;
    //             is_penalised: boolean;
    //             is_completed: boolean;
    //         }[] = await this.studentsRepository.query(
    //             `SELECT student_uuid, 
    //             journal_copy.journal_copy_uuid, 
    //             penalty_amount, return_date, 
    //             returned_at, paid_amount, 
    //             is_penalised, 
    //             is_completed 
    //             FROM fees_penalties 
    //             INNER JOIN students_table ON fees_penalties.borrower_uuid = students_table.student_uuid 
    //             INNER JOIN journal_copy ON fees_penalties.copy_uuid = journal_copy.journal_copy_uuid 
    //             WHERE students_table.is_archived = FALSE
    //             AND students_table.student_id = $1 
    //             AND journal_copy.is_archived = FALSE
    //             AND journal_copy.journal_copy_id = $2 
    //             AND penalty_amount > paid_amount
    //             AND is_completed = FALSE
    //             AND is_penalised = TRUE
    //             AND returned_at IS NOT NULL`,
    //             [updateFeesPayload.student_id, updateFeesPayload.copy_id],
    //         )

    //         if (!studentAndJournalCopiesPayloadWithFeesPenalties.length) {
    //             throw new HttpException(
    //                 'Cannot find Student or Book, maybe archived or No penalty or Not returned',
    //                 HttpStatus.BAD_REQUEST,
    //             );
    //         }

    //         // Extract necessary values
    //         const record = studentAndJournalCopiesPayloadWithFeesPenalties[0];

    //         // Accumulate total paid amount
    //         const accumulatedPaidAmount = updateFeesPayload.paid_amount + record.paid_amount;

    //         // Determine if penalty is cleared
    //         const isPenalised = accumulatedPaidAmount < record.penalty_amount; // True if penalty remains
    //         const isCompleted = !isPenalised; // True if penalty is fully paid

    //         // FIX: Add WHERE clause to prevent updating all records
    //         await this.feesPenaltiesRepository.query(
    //             `UPDATE fees_penalties 
    //              SET payment_method = $1, paid_amount = $2, is_penalised = $3, is_completed = $4
    //              WHERE student_uuid = $5 AND copy_uuid = $6`,
    //             [
    //                 updateFeesPayload.payment_method,
    //                 accumulatedPaidAmount,
    //                 true,
    //                 isCompleted,
    //                 record.student_uuid,
    //                 record.copy_uuid
    //             ],
    //         );

    //         return {
    //             statusCode: HttpStatus.OK,
    //             message: 'Penalty paid successfully!',
    //         };
    //     }catch(error){
    //         throw error
    //     }
    // }





    async payStudentFeeForPeriodicals(feesPayload: TCreatePenaltyZod) {
        try {
            console.log(feesPayload.journal_copy_id)

            const data = await this.journalsCopyRepository.query(
                `SELECT journal_copy_uuid FROM journal_copy WHERE journal_copy_id = $1`,
                [feesPayload.journal_copy_id]
            )
            const student = await this.studentsRepository.query(
                `SELECT student_uuid FROM students_table WHERE student_id = $1`,
                [feesPayload.student_id]
            )
            console.log(student)
            console.log(data)

            const penaltyPayload: {
                student_id: string;
                journal_copy_id: string;
                penalty_amount: number,
                return_date: Date,
                paid_amount: number,
                is_penalied: boolean,
                is_completed: boolean

            }[] = await this.studentsRepository.query(
                `SELECT student_uuid,
                journal_copy.journal_copy_uuid,
                penalty_amount,
                return_Date,
                paid_amount,
                is_penalized,
                is_completed
                FROM fees_penalties
                INNER JOIN student_table ON fees_penalties.borrower_uuid = students_table.student_uuid
                WHERE students_table.is_archived=FALSE
                AND students_table.student_id = $1
                AND journal_copy.is_archived = FALSE
                AND journal_copy.journal_copy_id = $2
                AND penalty_amount > paid_amount
                AND is_completed = FALSE
                AND is_penalized = TRUE
                AND returned_At IS NOT NULL
                `,
                [feesPayload.student_id, feesPayload.journal_copy_id]
            )

            if (!penaltyPayload.length) {
                throw new HttpException(
                    'Cannot find Student or Book, maybe archived or No penalty or Not returned',
                    HttpStatus.BAD_REQUEST,
                );
            }

            const record = penaltyPayload[0];

            // Accumulate total paid amount
            const accumulatedPaidAmount = feesPayload.paid_amount + record.paid_amount;

            // Determine if penalty is cleared
            const isPenalised = accumulatedPaidAmount < record.penalty_amount; // True if penalty remains
            const isCompleted = !isPenalised; // True if penalty is fully paid

            // FIX: Add WHERE clause to prevent updating all records
            await this.feesPenaltiesRepository.query(
                `UPDATE fees_penalties 
                 SET payment_method = $1, paid_amount = $2, is_penalised = $3, is_completed = $4
                 WHERE student_id = $5 AND book_copy_uuid = $6`,
                [
                    feesPayload.payment_method,
                    accumulatedPaidAmount,
                    true,
                    isCompleted,
                    record.student_id,
                    record.journal_copy_id
                ],
            );

            return {
                statusCode: HttpStatus.OK,
                message: 'Penalty paid successfully!',
            };

        } catch (error) {
            return { error: error }
        }
    }


    // -------- FILTER ROUTES -----------

    // Get penalties which are yet to be paid
    async getPenaltiesToBePaid() {
        const result = await this.feesPenaltiesRepository.query(
            `SELECT *, (penalty_amount - paid_amount) AS remaining_penalty
            FROM fees_penalties
            WHERE (penalty_amount - paid_amount) > 0 
            AND is_completed=false`
        );
        if (!result.length) {
            return { message: "No Penalties To Be Paid" }
        } else {
            return result
        }
    }

    // Get penalties that are paid
    async getCompletedPenalties() {
        const result = await this.feesPenaltiesRepository.query(
            `SELECT *, (penalty_amount - paid_amount) AS remaining_penalty
            FROM fees_penalties
            WHERE (penalty_amount - paid_amount) = 0 
            AND is_completed=true`
        );
        if (!result.length) {
            return { message: "No Penalties Found" }
        } else {
            return result
        }
    }


    async getStudentPenalties(student_id: string) {
        if (!student_id) {
            throw new HttpException("Student ID is required", HttpStatus.BAD_REQUEST);
        }

        // Get all penalties for the student
        const penalties = await this.feesPenaltiesRepository.query(
            `SELECT fp.*
               FROM fees_penalties fp
               INNER JOIN students_table s ON fp.borrower_uuid = s.student_uuid
               WHERE s.student_id = $1`,
            [student_id]
        );

        if (!penalties.length) {
            throw new HttpException("No penalty records found", HttpStatus.NOT_FOUND);
        }

        const completed = penalties.filter(p => p.is_completed === true);
        const notCompleted = penalties.filter(p => p.is_completed === false);

        return {
            penalties,   
            completed,       
            notCompleted  
        };
    }


    // Get pending penalties for a particular sutdent
    async getPenaltiesToBePaidForStudent(student_id: string) {
        if (!student_id) {
            throw new HttpException("Enter Student Id", HttpStatus.NOT_FOUND)
        }
        const student_uuid = await this.studentsRepository.query(
            `SELECT student_uuid FROM students_table WHERE student_id = $1`,
            [student_id]
        )
        if (!student_id.length) {
            throw new HttpException("Student With Given Id Not Found", HttpStatus.NOT_FOUND)
        }
        const result = await this.feesPenaltiesRepository.query(
            `SELECT * FROM fees_penalties WHERE borrower_uuid = $1 AND is_completed=false`,
            [student_uuid[0].student_uuid]
        )
        if (!result.length) {
            return { message: "Student Has No Penalties" }
        } else {
            return result
        }
    }

    // Get completed penalties for a particular student
    async getPendingPenaltiesForStudent(student_id: string) {
        if (!student_id) {
            throw new HttpException("Enter Student Id", HttpStatus.NOT_FOUND)
        }
        const student_uuid = await this.studentsRepository.query(
            `SELECT student_uuid FROM students_table WHERE student_id = $1`,
            [student_id]
        )
        if (!student_id.length) {
            throw new HttpException("Student With Given Id Not Found", HttpStatus.NOT_FOUND)
        }
        const result = await this.feesPenaltiesRepository.query(
            `SELECT * FROM fees_penalties WHERE borrower_uuid = $1 AND is_completed=true`,
            [student_uuid[0].student_uuid]
        )
        if (!result.length) {
            throw new HttpException("No Data Found", HttpStatus.NOT_FOUND);
        } else {
            return result
        }
    }







}
