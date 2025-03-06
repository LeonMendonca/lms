// update-book-title.dto.ts
import { IsString, IsOptional, IsDateString, IsInt, IsUUID, IsBoolean, IsDate, IsArray  } from 'class-validator';

export class UpdateBookTitleDTO {
  @IsString()
  @IsOptional()
  bookId: string;

  @IsString()
  @IsOptional()
  bookTitle?: string;

  @IsString()
  @IsOptional()
  bookAuthor?: string;

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
  isbn?: string;

  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsString()
  @IsOptional()
  callNumber?: string;

  @IsString()
  @IsOptional()
  authorMark?: string;
  
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

export class UpdateBookCopyDTO {
  @IsOptional()
  @IsString()
  sourceOfAcquisition?: string;

  @IsOptional()
  @IsDate()
  dateOfAcquisition?: Date;

  @IsOptional()
  @IsInt()
  billNo?: number;

  @IsOptional()
  @IsInt()
  noOfPages?: number;

  @IsOptional()
  @IsInt()
  noOfPreliminaryPages?: number;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsInt()
  inventoryNumber?: number;

  @IsOptional()
  @IsInt()
  accessionNumber?: number;

  @IsOptional()
  @IsString()
  barcode?: string;

  @IsOptional()
  @IsString()
  itemType?: string;

  @IsOptional()
  @IsUUID()
  instituteId?: string;

  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;

  @IsOptional()
  @IsArray()
  remarks?: string[];

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsOptional()
  additionalFields?: Record<string, any>;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}

