import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeesPenalties } from './fees-penalties.entity';
import { TUpdateFeesPenaltiesZod } from 'src/books_v2/zod/update-fp-zod';
import { JournalCopy } from 'src/journals/entity/journals_copy.entity';
import { JournalLogs } from 'src/journals/entity/journals_log.entity';
import { JournalTitle } from 'src/journals/entity/journals_title.entity';
import { Students } from 'src/students/students.entity';

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

    async getStudentFee(
        student_id: string,
        isPenalty: boolean,
        isCompleted: boolean,
    ) {
        try {
            if (student_id) {
                const result: { student_uuid: string }[] =
                    await this.studentsRepository.query(
                        `SELECT student_uuid FROM students_table WHERE student_id=$1`,
                        [student_id],
                    );
                if (result.length === 0) {
                    throw new HttpException(
                        { message: 'Invaid Student ID !!' },
                        HttpStatus.ACCEPTED,
                    );
                }
                const data = await this.journalsTitleRepository.query(
                    `SELECT * FROM fees_penalties WHERE borrower_uuid=$1 and is_penalised=$2 or is_completed= $3`,
                    [result[0].student_uuid, isPenalty, isCompleted],
                );
                if (data.length === 0) {
                    throw new HttpException(
                        { message: 'No Penalties are There!!' },
                        HttpStatus.ACCEPTED,
                    );
                }
                return data;
            }
            //00008-Tech University-2025
            else if (isPenalty) {
                const data = await this.feesPenaltiesRepository.query(
                    `SELECT * FROM fees_penalties WHERE is_penalised=$1`,
                    [isPenalty],
                );
                if (data.length === 0) {
                    throw new HttpException(
                        { message: 'No Penalties are Found!!' },
                        HttpStatus.ACCEPTED,
                    );
                }
                return data;
            } else if (isCompleted) {
                const data = await this.feesPenaltiesRepository.query(
                    `SELECT * FROM fees_penalties WHERE is_completed=$1`,
                    [isCompleted],
                );
                if (data.length === 0) {
                    throw new HttpException(
                        { message: 'No data are Found!!' },
                        HttpStatus.ACCEPTED,
                    );
                }
                return data;
            }
        } catch (error) {
            throw error;
        }
    }
    async getFullFeeList({ page,
        limit }: {
            page: number,
            limit: number,
        }) {
        try {
            const offset = (page - 1) * limit;

            const result = await this.journalsTitleRepository.query(
                `SELECT * FROM  fees_penalties LIMIT $1 OFFSET $2`, [limit, offset]
            ); const total = await this.journalsTitleRepository.query(
                `SELECT * FROM  fees_penalties LIMIT $1 OFFSET $2`, [limit, offset]
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
            }
            result;
        } catch (error) {
            throw error;
        }
    }
    async getFullFeeListStudent() {
        try {
            const result = await this.journalsTitleRepository
                .query(`SELECT students_table.student_id,book_copies.book_copy_id,students_table.student_name, students_table.department,book_titles.subject, fees_penalties.return_date, fees_penalties.created_at, fees_penalties.penalty_amount FROM  fees_penalties
             INNER JOIN students_table ON fees_penalties.borrower_uuid=students_table.student_uuid 
            INNER JOIN  book_copies ON fees_penalties.book_copy_uuid=book_copies.book_copy_uuid
            INNER JOIN book_titles ON book_titles.book_uuid= book_copies.book_title_uuid`);
            if (result.length === 0) {
                throw new HttpException(
                    { message: 'No data found!!' },
                    HttpStatus.ACCEPTED,
                );
            }
            return result;
        } catch (error) {
            throw error;
        }
    }
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
            const studentAndPeriodicalCopiesPayloadWithFeesPenalties: {
                student_uuid: string;
                book_copy_uuid: string;
                penalty_amount: number;
                return_date: Date;
                returned_at: Date;
                paid_amount: number;
                is_penalised: boolean;
                is_completed: boolean;
            }[] = await this.studentsRepository.query(
                `
            SELECT student_uuid, book_copies.book_copy_uuid, penalty_amount, return_date, returned_at, paid_amount, is_penalised, is_completed 
            FROM fees_penalties 
            INNER JOIN students_table ON fees_penalties.borrower_uuid = students_table.student_uuid 
            INNER JOIN book_copies ON fees_penalties.book_copy_uuid = book_copies.book_copy_uuid 
            WHERE students_table.is_archived = FALSE
            AND students_table.student_id = $1 
            AND book_copies.is_archived = FALSE
            AND book_copies.book_copy_id = $2 
            AND penalty_amount > paid_amount
            AND is_completed = FALSE
            AND is_penalised = TRUE
            AND returned_at IS NOT NULL`,
                [updateFeesPayload.student_id, updateFeesPayload.book_copy_id],
            );

            if (!studentAndPeriodicalCopiesPayloadWithFeesPenalties.length) {
                throw new HttpException(
                    'Cannot find Student or Book, maybe archived or No penalty or Not returned',
                    HttpStatus.BAD_REQUEST,
                );
            }

            //Values when penalty
            let isPenalised =
                studentAndPeriodicalCopiesPayloadWithFeesPenalties[0].is_penalised; //True
            let isCompleted =
                studentAndPeriodicalCopiesPayloadWithFeesPenalties[0].is_completed; //False

            //current paid amount + new paid amount
            let accumulatedPaidAmount =
                updateFeesPayload.paid_amount +
                studentAndPeriodicalCopiesPayloadWithFeesPenalties[0].paid_amount;

            //if student pays less than penalty amount then subtraction results gt 0;
            if (
                studentAndPeriodicalCopiesPayloadWithFeesPenalties[0].penalty_amount -
                accumulatedPaidAmount <=
                0
            ) {
                isPenalised = !isPenalised;
                isCompleted = !isCompleted;
            }

            await this.feesPenaltiesRepository.query(
                `
            UPDATE fees_penalties SET payment_method = $1, paid_amount = $2, is_penalised = $3, is_completed = $4`,
                [
                    updateFeesPayload.payment_method,
                    accumulatedPaidAmount,
                    isPenalised,
                    isCompleted,
                ],
            );

            return {
                statusCode: HttpStatus.OK,
                messsage: 'Penalty paid successfully!',
            };
        } catch (error) {
            throw error;
        }
    }
}
