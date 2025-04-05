import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InstituteConfig } from './entity/institute_config.entity';
import { TInstituteDTO } from './zod-validation/create-institute-zod';
import { insertQueryHelper, updateQueryHelper } from 'src/misc/custom-query-helper';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { genInstituteId } from './id-generation/create-insitute_id';
import { create } from 'domain';
import { TInstituteUpdateDTO } from './zod-validation/update-institute-zod';
import { TLibraryDTO } from './zod-validation/create-library_rules-zod';
import { genRuleId } from './id-generation/create-library_rule_id';
import { LibraryConfig } from './entity/library_config.entity';
import { TLibraryUpdateDTO } from './zod-validation/update-library_rules-zod';

@Injectable()
export class ConfigService {

    constructor(
        @InjectRepository(InstituteConfig)
        private instituteConfigRepository: Repository<InstituteConfig>,


        @InjectRepository(LibraryConfig)
        private libraryConfigRepository: Repository<LibraryConfig>,
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

    // Get Institute By Id
    async getInstituteById(institute_id: string){
        if(!institute_id.length){
            return {message:"Enter The Institute Id"}
        }
        const result =  await this.instituteConfigRepository.query(
            `SELECT * FROM institute_config WHERE institute_id=$1 AND is_archived=false`,
            [institute_id]
        )
        if (!result.length){
            return {message: "No Institute With The Id Found"}
        }else{
            return result
        }
    }

    //  Get Institute Detail For user (admin)
    async getInstituteName(){
        const insts = await this.instituteConfigRepository.query(
            `SELECT institute_name, institute_uuid FROM institute_config WHERE is_archived=false`
        )
        if(!insts.length){
            return {message : "No Institutes Exists"}
        }else{
            return insts
        }

    }

    // Create Institute
    async createInstitute(institutePayload: TInstituteDTO){
        try{
            // check if institute with same name exists 
            const created_date = new Date().toISOString();
            const instituteName = institutePayload.institute_name

            const data = await this.instituteConfigRepository.query(
                `SELECT * FROM institute_config WHERE institute_name=$1`,
                [instituteName]
            )
            if(data.length){
                return {message:"Institute With Same Name Already Exists"}
            }
            // Generate institute ID
            const institute_id = genInstituteId(instituteName, created_date);

            // Check if institute with the same ID exists
            const existingInstitute = await this.instituteConfigRepository.query(
                `SELECT * FROM institute_config WHERE institute_id=$1`,
                [institute_id]
            );
            if (existingInstitute.length > 0) {
                throw new HttpException("Institute With Same ID Exists", HttpStatus.BAD_REQUEST);
            }

            // Generate Institute Abbreviation
            const institute_abbr = instituteName.split(" ").map((item)=>(item[0] === item[0].toUpperCase()) ? item[0]:"").join("")

            // Prepare final payload with generated fields
            const finalPayload = {
                ...institutePayload,
                institute_abbr: institute_abbr,
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



        }catch(error){
            console.error("Error updating institute:", error);
            throw new HttpException(
                `Error: ${error.message || error} while updating institute.`,
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
    // async createInstitute(institutePayload: TInstituteDTO) {
    //     try {
    //         const created_date = new Date().toISOString(); // Use ISO format
    //         const instituteName = institutePayload.institute_name

    //         // Generate institute ID
    //         const institute_id = genInstituteId(instituteName, created_date);

    //         // Generate Institute Abbreviation
    //         const institute_abbr = instituteName.split(" ").map((item)=>(item[0] === item[0].toUpperCase()) ? item[0]:"").join("")

    //         // Check if institute with the same ID exists
    //         const existingInstitute = await this.instituteConfigRepository.query(
    //             `SELECT * FROM institute_config WHERE institute_id=$1`,
    //             [institute_id]
    //         );
    //         if (existingInstitute.length > 0) {
    //             throw new HttpException("Institute With Same ID Exists", HttpStatus.BAD_REQUEST);
    //         }

    //         // Prepare final payload with generated fields
    //         const finalPayload = {
    //             ...institutePayload,
    //             institute_abbr: institute_abbr,
    //             institute_id: institute_id,
    //             created_date: created_date,
    //         };

    //         // Generate query data
    //         const insertQuery = insertQueryHelper(finalPayload, []);

    //         // Convert objects/arrays to JSON before passing to the query
    //         const sanitizedValues = insertQuery.values.map((value) =>
    //             typeof value === "object" ? JSON.stringify(value) : value
    //         );

    //         // Construct query argument placeholders dynamically ($1, $2, $3...)
    //         const queryArgs = insertQuery.values.map((_, i) => `$${i + 1}`).join(", ");

    //         // Execute the insert query
    //         await this.instituteConfigRepository.query(
    //             `INSERT INTO institute_config (${insertQuery.queryCol}) VALUES (${queryArgs})`,
    //             sanitizedValues
    //         );

    //         return { statusCode: HttpStatus.CREATED, message: "Institute Created!" };

    //     } catch (error) {
    //         console.error("Error creating institute:", error);
    //         throw new HttpException(
    //             `Error: ${error.message || error} while creating institute.`,
    //             HttpStatus.INTERNAL_SERVER_ERROR
    //         );
    //     }
    // }

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

            return { 
                result : existingInstitute,
                statusCode: HttpStatus.OK, 
                message: "Institute Updated Successfully!" 
            };

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

    // Get All Library Rules
    async getRule() {
        const result = await this.libraryConfigRepository.query(
            `SELECT * FROM library_config WHERE is_archived=false`
        )
        if (!result.length) {
            return result
        }else{
            return { message: "No Rule Found" }
        }
    }

    // Get Library Rule By Id
    async getRuleById(rule_id: string){
        // ensure the rule id is passed
        if(!rule_id.length){
            return {message:"Enter The Rule Id"}
        }
        // check if the rule with the given id exists
        const data = await this.libraryConfigRepository.query(
            `SELECT * FROM library_config WHERE library_rule_id=$1 AND is_archived=false`,
            [rule_id]
        )
        if(!data.length){
            return {message: "No Rule With The Given Id Exists"}
        }else{
            return data
        }
    }

    // Create Library Rules
    async createLibrary(rulesPayload: TLibraryDTO) {
        // Generate institute ID
        const created_at = new Date().toISOString(); // Use ISO format
        const institute_id = rulesPayload.institute_id

        const maxIdQuery = await this.libraryConfigRepository.query(
            `SELECT MAX(library_rule_id) as max_id FROM library_config`
        )
        const maxId = maxIdQuery[0]?.max_id || "000"

        const library_rule_id = genRuleId(institute_id, maxId);

        // Check if rule with the same ID exists
        const existingRule = await this.libraryConfigRepository.query(
            `SELECT * FROM library_config WHERE library_rule_id=$1`,
            [library_rule_id]
        );
        if (existingRule.length > 0) {
            throw new HttpException("Rule With Same ID Exists", HttpStatus.BAD_REQUEST);
        }
        // Prepare final payload with generated fields
        const finalPayload = {
            ...rulesPayload,
            library_rule_id: library_rule_id,
            created_at: created_at,
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
        await this.libraryConfigRepository.query(
            `INSERT INTO library_config (${insertQuery.queryCol}) VALUES (${queryArgs})`,
            sanitizedValues
        );

        return { statusCode: HttpStatus.CREATED, message: "Rule Created!" };
    }

    // Update Library Rules Info
    async updateRule(updateLibraryPayload: TLibraryUpdateDTO) {
        try {
            // Generate query for update
            const queryData = updateQueryHelper<TLibraryUpdateDTO>(updateLibraryPayload, []);

             // Check if the institute exists and is not archived
             const existingRule = await this.libraryConfigRepository.query(
                `SELECT * FROM library_config WHERE library_rule_id=$1 AND is_archived=false`,
                [updateLibraryPayload.library_rule_id]
            );
            if (existingRule.length === 0) {
                throw new HttpException("No Rule Found", HttpStatus.NOT_FOUND);
            }

            // Execute the update query with parameterized values
            await this.libraryConfigRepository.query(
                `UPDATE library_config SET ${queryData.queryCol} WHERE library_rule_id=$${queryData.values.length + 1} AND is_archived=false`,
                [...queryData.values, updateLibraryPayload.library_rule_id] // Add institute_id at the end
            );

            return { statusCode: HttpStatus.OK, message: "Rule Updated Successfully!" };



        } catch (error) {
            console.error("Error updating institute:", error);
            throw new HttpException(
                `Error: ${error.message || error} while updating institute.`,
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }


    // Delete (Archive) Library Rules
    async archiveRule(rule_id) {
        try {
            if (!rule_id.length) {
                return { message: "Insert Id!" }
            }
            const inst = await this.libraryConfigRepository.query(
                `SELECT * FROM library_config WHERE library_rule_id=$1 AND is_archived=false`,
                [rule_id]
            )
            if (!inst.length) {
                return { message: "No Institute Found" }
            }

            await this.libraryConfigRepository.query(
                `UPDATE library_config SET is_archived=true WHERE library_rule_id=$1`,
                [rule_id]
            )
            return { message: "Rule Deleted" }
        } catch (error) {
            return { error: error.message }
        }
    }

    // Restore Library Rules
    async restoreRule(rule_id: string) {
        try {
            if (!rule_id.length) {
                return { message: "Insert Id!" }
            }
            const inst = await this.libraryConfigRepository.query(
                `SELECT * FROM library_config WHERE library_rule_id=$1 AND is_archived=true`,
                [rule_id]
            )
            if (!inst.length) {
                return { message: "Rule not found or already active" }
            }
            await this.libraryConfigRepository.query(
                `UPDATE library_config SET is_archived = false WHERE library_rule_id = $1`,
                [rule_id],
            );
            return { message: 'Rule restored successfully' };
        } catch (error) {
            return { error: error.message }
        }
    }

}
