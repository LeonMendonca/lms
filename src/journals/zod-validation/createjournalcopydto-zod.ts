import { IsString, IsUUID, IsDateString, IsInt, IsOptional } from 'class-validator';

export class CreateJournalCopyDTO {
    @IsUUID()
    journalUUID: string;

    @IsString()
    @IsOptional()
    callNumber?: string;

    @IsString()
    authorMark: string;

    @IsString()
    sourceOfAcquisition: string;

    @IsDateString()
    dateOfAcquisition: string;

    @IsInt()
    billNo: number;

    @IsInt()
    noOfPages: number;

    @IsInt()
    noOfPreliminaryPages: number;

    @IsString()
    language: string;

    @IsOptional()
    @IsInt()
    inventoryNumber?: number;

    @IsInt()
    accessionNumber: number;

    @IsString()
    barcode: string;

    @IsString()
    itemType: string;

    @IsUUID()
    @IsOptional()
    instituteId?: string;

    @IsOptional()
    isArchived?: boolean;

    @IsOptional()
    @IsUUID()
    createdBy?: string;

    @IsOptional()
    remarks?: string[];

    @IsOptional()
    images?: string[];

    @IsOptional()
    additionalFields?: any;

    @IsOptional()
    description?: string;

    @IsOptional()
    isAvailable?: boolean;
}
