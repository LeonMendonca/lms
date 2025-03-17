import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TrialTable } from './entity/trial_table.entity';
import { Repository, DataSource } from 'typeorm';
import { TrialCopy } from './entity/trial_copy.entity';
import { createTrialDto } from './zod/createtrial-zod';
import { createTrialCopyDto, trialCopySchema } from './zod/createcopy-zod';
import { UUID } from 'crypto';

@Injectable()
export class TrialService {
    constructor(
        @InjectRepository(TrialTable)
        private trialTableRepo: Repository<TrialTable>,

        @InjectRepository(TrialCopy)
        private trialCopyRepo: Repository<TrialCopy>,

        private readonly dataSource: DataSource,
    ) { }

    async createJournal(trialPayload: createTrialDto, copyPayload: createTrialCopyDto) {
        const queryRunner = this.dataSource.createQueryRunner()

        await queryRunner.connect()
        await queryRunner.startTransaction()

        try {
            // Insert into trial_table without explicitly specifying column names
            const trialTableInsert = await queryRunner.query(
                `INSERT INTO trial_table VALUES (DEFAULT, $1, $2, $3) RETURNING uuid`,
                [trialPayload.journal_name, trialPayload.total_count, trialPayload.available_count]
            );

            const trialUuid = trialTableInsert[0].uuid; // Get inserted UUID

            // Bulk Insert into trial_copy using generate_series()
            await queryRunner.query(
                `INSERT INTO trial_copy 
                SELECT $1, 'Copy ' || gs.num 
                FROM generate_series(1, $2) AS gs(num)`,
                [trialUuid, trialPayload.total_count]
            );

            await queryRunner.commitTransaction();
            return { trialUuid, trialTableInsert };
        } catch (error) {
            await queryRunner.rollbackTransaction()
            throw new Error(`Transaction failed: ${error.message}`);
        } finally {
            await queryRunner.release()
        }
    }
}
