import { IsNumber, IsString } from "class-validator";

export class CronDTO {
    @IsString()
    name: string;

    @IsNumber()
    seconds: number;

}