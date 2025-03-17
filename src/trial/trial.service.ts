import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TrialTable } from './entity/trial_table.entity';
import { Repository, DataSource } from 'typeorm';
import { TrialCopy } from './entity/trial_copy.entity';
import { createTrialDto } from './zod/createtrial-zod';
import { createTrialCopyDto, trialCopySchema } from './zod/createcopy-zod';

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
            // Insert into trial_table with explicit column names
            const trialTableInsert = await queryRunner.query(
                `INSERT INTO trial_table ("journal_name", "total_count", "available_count")
                VALUES ($1, $2, $3) RETURNING uuid`,
                [trialPayload.journal_name, trialPayload.total_count, trialPayload.available_count]
            );

            const trialUuid = trialTableInsert[0].uuid; // Get inserted UUID

            const copyValues: (string | number)[] = []; // Explicitly define types for UUID and name
            const placeholders: string[] = []; // Explicitly define it as an array of strings

            for (let i = 0; i < trialPayload.total_count; i++) {
                copyValues.push(trialUuid, `Copy ${i + 1}`);

                const baseIndex = i * 2; // Every row has two values (uuid, name)
                placeholders.push(`($${baseIndex + 1}, $${baseIndex + 2})`);
            }

            // Bulk Insert into trial_copy
            await queryRunner.query(
                `INSERT INTO trial_copy ("uuid", "journal_name") VALUES ${placeholders.join(", ")}`,
                copyValues
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
