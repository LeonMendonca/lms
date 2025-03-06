// create-book-title.dto.ts
import { IsString, IsNotEmpty, IsDateString, IsInt, IsOptional } from 'class-validator';

export class CreateBookTitleDTO {
  @IsString()
  @IsNotEmpty()
  bookId: string;

  @IsString()
  @IsNotEmpty()
  bookTitle: string;

  @IsString()
  @IsNotEmpty()
  bookAuthor: string;

  @IsString()
  @IsNotEmpty()
  nameOfPublisher: string;

  @IsString()
  @IsNotEmpty()
  placeOfPublication: string;

  @IsDateString()
  @IsNotEmpty()
  yearOfPublication: string;

  @IsString()
  @IsNotEmpty()
  edition: string;

  @IsString()
  @IsNotEmpty()
  isbn: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  department: string;

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
