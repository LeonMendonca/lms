import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Patch, Post, Put, UsePipes } from '@nestjs/common';
import { ConfigService } from './config.service';
import { bodyValidationPipe } from 'src/pipes/body-validation.pipe';
import { createInstituteSchema, TInstituteDTO } from './zod-validation/create-institute-zod';
import { TInstituteUpdateDTO, updateInstituteSchema } from './zod-validation/update-institute-zod';

@Controller('config')
export class ConfigController {
    constructor(private configService: ConfigService) { }

    //  ------------- INSTITUTE CONFIGURATIONS ----------

    // Get Institute Info
    @Get('get-institute')
    async getInstitute() {
        return this.configService.getInstitute()
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

    // Get Library Rules Info

    // Create Library Rules

    // Update Library Rules Info

    // Delete (Archive) Library Rules
}
