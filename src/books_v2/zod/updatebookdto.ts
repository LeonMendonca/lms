// update-book-title.dto.ts
import { IsString, IsOptional, IsDateString, IsInt } from 'class-validator';

export class UpdateBookTitleDTO {
  @IsString()
  @IsOptional()
  bookId?: string;

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
