import { IsInt, IsNotEmpty, IsString } from "class-validator";

export class AddBookDTO {
    @IsInt()
    @IsNotEmpty()
    book_id: number;

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

    @IsString()
    @IsNotEmpty()
    book_borrowed: string;

    @IsString()
    @IsNotEmpty()
    date_of_borrowing: string;

    @IsString()
    @IsNotEmpty()
    department: string;
}
