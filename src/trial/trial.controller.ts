import { Body, Controller, Post } from '@nestjs/common';
import { TrialService } from './trial.service';

@Controller('trial')
export class TrialController {

    constructor(private readonly trialService: TrialService) { }

    @Post('create-with-copy')
    async createTrialWithCopy(@Body() body: any,) {
        return this.trialService.createJournal(body.trial, body.copy);
    }
}
