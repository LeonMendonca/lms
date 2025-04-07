import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Param, Patch, Post, Put, Query, UsePipes } from '@nestjs/common';
import { ConfigService } from './config.service';
import { bodyValidationPipe } from 'src/pipes/body-validation.pipe';
import { createInstituteSchema, TInstituteDTO } from './zod-validation/create-institute-zod';
import { TInstituteUpdateDTO, updateInstituteSchema } from './zod-validation/update-institute-zod';
import { createLibraryRuleSchema, TLibraryDTO } from './zod-validation/create-library_rules-zod';
import { TLibraryUpdateDTO, updateLibraryRuleSchema } from './zod-validation/update-library_rules-zod';

@Controller('config')
export class ConfigController {
    constructor(private configService: ConfigService) { }

    //  ------------- INSTITUTE CONFIGURATIONS ----------

    // Get Institute Info
    @Get('get-institute')
    async getInstitute(
        @Query('_user_uuid') institute_id: string,
    ) {
        return this.configService.getInstitute(institute_id)
    }

    // Get Institute by id
    @Get('get-institutebyid')
    async getInstituteById(@Query('institute_id') institute_id: string) {
        return this.configService.getInstituteById(institute_id)
    }

    //  Get Institute Detail For user (admin)
    @Get('get-institute-names')
    async getInstituteName() {
        return this.configService.getInstituteName()
    }

    // Create Institute
    @Post('create-institute')
    @UsePipes(new bodyValidationPipe(createInstituteSchema))
    async createInstitute(@Body() institutePayload: TInstituteDTO) {
        try {
            const result = await this.configService.createInstitute(institutePayload);
            return result
        } catch (error) {
            if (!(error instanceof HttpException)) {
                throw new HttpException(
                    error.message,
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            } else {
                throw error;
            }
        }
    }

    // Update Institute Info
    @Patch('update-institute')
    @UsePipes(new bodyValidationPipe(updateInstituteSchema))
    async updateInstitute(@Body() updateInstitutePayload: TInstituteUpdateDTO) {
        try {
            const result =
                await this.configService.updateInstitute(updateInstitutePayload);
            return result;
        } catch (error) {
            if (!(error instanceof HttpException)) {
                throw new HttpException(
                    error.message,
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
            throw error;
        }
    }

    // Delete (Archive) Institute
    @Put('delete-institute')
    async archiveInstitute(@Body('institute_id') institute_id: string) {
        return this.configService.archiveInstitute(institute_id);
    }

    // Restore Institute
    @Put('restore-institute')
    async restoreInstitute(@Body('institute_id') institute_id: string) {
        return this.configService.restoreInstitute(institute_id);
    }

    //  -------------- LIBRARY CONFIGURATIONS -----------

    // Get Library Rules 
    @Get('get-all-rules')
    async getRule() {
        return this.configService.getRule()
    }

    @Get('get-rule-by-id')
    async getRuleById(@Query('rule_id') rule_id: string) {
        return this.configService.getRuleById(rule_id);
    }

    // Create Library Rules
    @Post('create-library-rule')
    @UsePipes(new bodyValidationPipe(createLibraryRuleSchema))
    async createLibrary(@Body() rulesPayload: TLibraryDTO) {
        try {
            const result = await this.configService.createLibrary(rulesPayload);
            return result
        } catch (error) {
            if (!(error instanceof HttpException)) {
                throw new HttpException(
                    error.message,
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            } else {
                throw error;
            }
        }
    }

    // Update Library Rules Info
    @Patch('update-rule')
    @UsePipes(new bodyValidationPipe(updateLibraryRuleSchema))
    async updateRule(@Body() updateLibraryPayload: TLibraryUpdateDTO) {
        try {
            const result =
                await this.configService.updateRule(updateLibraryPayload);
            return result;
        } catch (error) {
            if (!(error instanceof HttpException)) {
                throw new HttpException(
                    error.message,
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
            throw error;
        }
    }

    // Delete (Archive) Library Rules
    @Put('delete-rule')
    async archiveRule(@Body('rule_id') rule_id: string) {
        return this.configService.archiveRule(rule_id);
    }

    // Restore Library Rules
    @Put('restore-rule')
    async restoreRule(@Body('rule_id') rule_id: string) {
        return this.configService.restoreRule(rule_id);
    }


    // Get Rule By Institute Id
    @Get('get-rule-by-institute-id')
    async getRuleByInstituteId(@Query('institute_id') institute_id: string) {
        if (!institute_id) {
            throw new HttpException("Institute ID is required", HttpStatus.BAD_REQUEST);
        }
        return this.configService.getRuleByInstituteId(institute_id);
    }


    // ---------- INSTITUTE AND USER INTEGRATIONS ROUTES ----------


    //  ---------- INSTITUTE AND LIBRARY BASED ROUTES -----------
    @Get('get-rule-by-institute_uuid')
    async getRulebyInstituteId(@Query('institute_uuid') institute_uuid: string){
        return this.configService.getRulebyInstituteId(institute_uuid)

    }


}
