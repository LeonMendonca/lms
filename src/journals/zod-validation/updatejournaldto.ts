import { IsString, IsOptional, IsDateString, IsInt } from 'class-validator';

export class UpdateJournalTitleDTO {
    @IsString()
    @IsOptional()
    journalTitle?: string;

    @IsString()
    @IsOptional()
    editorName?: string;

    @IsString()
    @IsOptional()
    nameOfPublisher?: string;

    @IsDateString()
    @IsOptional()
    subscriptionStartDate: string;

    @IsDateString()
    @IsOptional()
    subscriptionEndDate: string;

    @IsString()
    @IsOptional()
    placeOfPublication?: string;

    @IsString()
    @IsOptional()
    issn?: string;

    @IsString()
    @IsOptional()
    volumeNumber: string;

    @IsString()
    @IsOptional()
    classificationNumber: string;

    @IsInt()
    @IsOptional()
    totalCount?: number;

    @IsInt()
    @IsOptional()
    availableCount?: number;

    @IsOptional()
    remarks?: string[];

    @IsOptional()
    titleImages?: string[];

    @IsOptional()
    titleAdditionalFields?: any;

    @IsOptional()
    titleDescription?: string;
}
