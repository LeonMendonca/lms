import { IsString, IsUUID, IsDateString, IsInt, IsOptional } from 'class-validator';

export class CreateJournalCopyDTO {
    @IsUUID()
    journalUUID: string;

    @IsString()
    journalCopyId: string

    @IsString()
    barcode: string;

    @IsString()
    itemType: string;

    @IsUUID()
    @IsOptional()
    instituteUuid?: string;

    @IsOptional()
    isArchived?: boolean;

    @IsOptional()
    @IsUUID()
    createdBy?: string;

    @IsOptional()
    remarks?: string[];

    @IsOptional()
    copyImages?: string[];

    @IsOptional()
    copyAdditionalFields?: any;

    @IsOptional()
    copyDescription?: string;

    @IsOptional()
    isAvailable?: boolean;
}
