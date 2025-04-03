import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InstituteConfig } from './entity/institute_config.entity';
import { TInstituteDTO } from './zod-validation/create-institute-zod';
import { insertQueryHelper, updateQueryHelper } from 'src/misc/custom-query-helper';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { genInstituteId } from './id-generation/create-insitute_id';
import { create } from 'domain';
import { TInstituteUpdateDTO } from './zod-validation/update-institute-zod';

@Injectable()
export class ConfigService {

    constructor(
        @InjectRepository(InstituteConfig)
        private instituteConfigRepository: Repository<InstituteConfig>,
    ) { }

    //  ------------- INSTITUTE CONFIGURATIONS ----------

    // Get Institute Info
    async getInstitute() {
        const result = await this.instituteConfigRepository.query(
            `SELECT * FROM institute_config WHERE is_archived=false`
        )
        if (!result.length) {
            return { message: "No Institute Found" }
        }
        return result
    }

    // Create Institute
    async createInstitute(institutePayload: TInstituteDTO) {
        try {
            // Generate institute ID
            const created_date = new Date().toISOString(); // Use ISO format
            const institute_id = genInstituteId(institutePayload.institute_name, created_date);
            console.log("Generated Institute ID:", institute_id);

            // Check if institute with the same ID exists
            const existingInstitute = await this.instituteConfigRepository.query(
                `SELECT * FROM institute_config WHERE institute_id=$1`,
                [institute_id]
            );

            if (existingInstitute.length > 0) {
                throw new HttpException("Institute With Same ID Exists", HttpStatus.BAD_REQUEST);
            }

            // Prepare final payload with generated fields
            const finalPayload = {
                ...institutePayload,
                institute_id: institute_id,
                created_date: created_date,
            };

            // Generate query data
            const insertQuery = insertQueryHelper(finalPayload, []);

            // Convert objects/arrays to JSON before passing to the query
            const sanitizedValues = insertQuery.values.map((value) =>
                typeof value === "object" ? JSON.stringify(value) : value
            );

            // Construct query argument placeholders dynamically ($1, $2, $3...)
            const queryArgs = insertQuery.values.map((_, i) => `$${i + 1}`).join(", ");

            // Execute the insert query
            await this.instituteConfigRepository.query(
                `INSERT INTO institute_config (${insertQuery.queryCol}) VALUES (${queryArgs})`,
                sanitizedValues
            );

            return { statusCode: HttpStatus.CREATED, message: "Institute Created!" };

        } catch (error) {
            console.error("Error creating institute:", error);
            throw new HttpException(
                `Error: ${error.message || error} while creating institute.`,
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    // Update Institute Info
    async updateInstitute(updateInstitutePayload: TInstituteUpdateDTO) {
        try {
            // Generate query for update
            const queryData = updateQueryHelper<TInstituteUpdateDTO>(updateInstitutePayload, []);

            // Check if the institute exists and is not archived
            const existingInstitute = await this.instituteConfigRepository.query(
                `SELECT * FROM institute_config WHERE institute_id=$1 AND is_archived=false`,
                [updateInstitutePayload.institute_id]
            );

            if (existingInstitute.length === 0) {
                throw new HttpException("No Institute Found", HttpStatus.NOT_FOUND);
            }

            // Execute the update query with parameterized values
            await this.instituteConfigRepository.query(
                `UPDATE institute_config SET ${queryData.queryCol} WHERE institute_id=$${queryData.values.length + 1} AND is_archived=false`,
                [...queryData.values, updateInstitutePayload.institute_id] // Add institute_id at the end
            );

            return { statusCode: HttpStatus.OK, message: "Institute Updated Successfully!" };

        } catch (error) {
            console.error("Error updating institute:", error);
            throw new HttpException(
                `Error: ${error.message || error} while updating institute.`,
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }


    // Delete (Archive) Institute
    async archiveInstitute(institute_id: string) {
        try {
            if (!institute_id.length) {
                return { message: "Insert Id!" }
            }
            const inst = await this.instituteConfigRepository.query(
                `SELECT * FROM institute_config WHERE institute_id=$1 AND is_archived=false`,
                [institute_id]
            )
            if (!inst.length) {
                return { message: "No Institute Found" }
            }

            await this.instituteConfigRepository.query(
                `UPDATE institute_config SET is_archived=true WHERE institute_id=$1`,
                [institute_id]
            )
            return { message: "Institute Deleted" }
        } catch (error) {
            return { error: error.message }
        }
    }

    // Restore Institute
    async restoreInstitute(institute_id: string) {
        try {
            if (!institute_id.length) {
                return { message: "Insert Id!" }
            }
            const inst = await this.instituteConfigRepository.query(
                `SELECT * FROM institute_config WHERE institute_id=$1 AND is_archived=true`,
                [institute_id]
            )
            if (!inst.length) {
                return { message: "Institute not found or already active" }
            }
            await this.instituteConfigRepository.query(
                `UPDATE institute_config SET is_archived = false WHERE institute_id = $1`,
                [institute_id],
            );
            return { message: 'Institute restored successfully' };
        } catch (error) {
            return { error: error.message }
        }
    }




    //  -------------- LIBRARY CONFIGURATIONS -----------

    // Get Library Rules Info

    // Create Library Rules

    // Update Library Rules Info

    // Delete (Archive) Library Rules
}
