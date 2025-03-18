import { Body, Controller, Put, HttpStatus, Param, ParseUUIDPipe, Post, Get } from '@nestjs/common';
import { TrialService } from './trial.service';
import { UUID } from 'crypto';

@Controller('trial')
export class TrialController {

    constructor(private readonly trialService: TrialService) { }


    @Get('get-from-trials')
    async getFromTrialTable() {
        return this.trialService.getFromTrialTable()
    }

    @Post('create-with-copy')
    async createTrialWithCopy(@Body() body: any,) {
        return this.trialService.createJournal(body.trial, body.copy);
    }

    @Put('delete-with-copy/:uuid')
    async deleteTrialWithCopy(
        @Param(
            'uuid',
            new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
        )
        uuid: UUID,
    ) {
        try {
            const result = await this.trialService.deleteTrialWithCopy(uuid)
            if (result[1]) {
                return {
                    message: "Journal Deleted Successfully!",
                    deleted_journal: result
                }
            } else {
                throw new Error(`Journal With UUID ${uuid} Not Found`)
            }
        } catch (error) {
            throw new Error(error)
        }
    }
}
