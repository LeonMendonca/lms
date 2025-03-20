import { IsString, IsOptional, IsDateString, IsInt } from 'class-validator';

export class UpdateJournalTitleDTO {
    @IsString()
    @IsOptional()
    journalId?: string;

    @IsString()
    @IsOptional()
    journalTitle?: string;

    @IsString()
    @IsOptional()
    journalAuthor?: string;

    @IsString()
    @IsOptional()
    nameOfPublisher?: string;

    @IsString()
    @IsOptional()
    placeOfPublication?: string;

    @IsDateString()
    @IsOptional()
    yearOfPublication?: string;

    @IsString()
    @IsOptional()
    edition?: string;

    @IsString()
    @IsOptional()
    issn?: string;

    @IsString()
    @IsOptional()
    subject?: string;

    @IsString()
    @IsOptional()
    department?: string;

    @IsInt()
    @IsOptional()
    totalCount?: number;

    @IsInt()
    @IsOptional()
    availableCount?: number;

    @IsOptional()
    remarks?: string[];

    @IsOptional()
    images?: string[];

    @IsOptional()
    additionalFields?: any;

    @IsOptional()
    description?: string;
}
