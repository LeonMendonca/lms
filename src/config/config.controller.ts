import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Post, UsePipes } from '@nestjs/common';
import { ConfigService } from './config.service';
import { bodyValidationPipe } from 'src/pipes/body-validation.pipe';
import { createInstituteSchema, TInstituteDTO } from './zod-validation/create-institute-zod';
import { InstituteConfig } from './entity/institute_config.entity';

@Controller('config')
export class ConfigController {
    constructor(private configService: ConfigService) { }

    //  ------------- INSTITUTE CONFIGURATIONS ----------

    // Get Institute Info

    @Get('get-institute')
    async getInstitute(){
        return this.configService.getInstitute()
    }

    // Create Institute
    @Post('create-institute')
    @UsePipes(new bodyValidationPipe(createInstituteSchema))
    async createInstitute(@Body() institutePayload: TInstituteDTO) {
        try {
            const result =  await this.configService.createInstitute(institutePayload);
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

    // Delete (Archive) Institute





    //  -------------- LIBRARY CONFIGURATIONS -----------

    // Get Library Rules Info

    // Create Library Rules

    // Update Library Rules Info

    // Delete (Archive) Library Rules
}
