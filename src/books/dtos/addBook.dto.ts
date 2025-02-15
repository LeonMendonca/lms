import { IsBoolean, IsInt, IsNotEmpty, IsString, IsUUID, Validate } from "class-validator";

export class AddBookDTO {
    // @IsInt()
    // @IsNotEmpty()
    // @IsUUID()
    book_id: string;

    @IsString()
    @IsNotEmpty()
    book_name: string;


    @IsString()
    @IsNotEmpty()
    book_author: string;

    @IsString()
    @IsNotEmpty()
    book_edition: string;

    @IsString()
    @IsNotEmpty()
    book_publisher: string;

    @IsString()
    @IsNotEmpty()
    book_publish_year: string;

    @IsBoolean()
    @IsNotEmpty()
    book_borrowed: boolean;

    @IsString()
    @IsNotEmpty()
    date_of_borrowing: string;

    @IsString()
    @IsNotEmpty()
    department: string;
}
