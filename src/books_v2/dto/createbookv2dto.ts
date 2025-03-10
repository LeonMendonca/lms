import { IsString, IsUUID, IsDateString, IsInt, IsBoolean, IsOptional, IsArray } from 'class-validator';

export class CreateBookCopyDTO {
  @IsString()
  bookId: string;

  @IsString()
  bookTitle: string;

  @IsString()
  bookAuthor: string;

  @IsString()
  nameOfPublisher: string;

  @IsString()
  placeOfPublication: string;

  @IsDateString()
  yearOfPublication: Date;

  @IsString()
  edition: string;

  @IsString()
  isbn: string;

  @IsString()
  subject: string;

  @IsString()
  department: string;

  @IsString()
  @IsOptional()
  callNumber?: string;

  @IsString()
  authorMark: string;

  @IsInt()
  totalCount: number;

  @IsInt()
  availableCount: number;

  @IsString()
  sourceOfAcquisition: string;

  @IsDateString()
  dateOfAcquisition: Date;

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

  @IsUUID()
  @IsOptional()
  createdBy?: string;

  @IsArray()
  @IsOptional()
  remarks?: string[];

  @IsArray()
  @IsOptional()
  images?: string[];

  @IsOptional()
  additionalFields?: any;

  @IsOptional()
  description?: string;
}