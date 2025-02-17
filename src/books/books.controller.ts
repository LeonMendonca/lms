import { Controller, Get, Post, Body, Query, UsePipes, ValidationPipe, HttpStatus, HttpCode } from "@nestjs/common";
import { BookService } from "./books.service";
import { AddBookDTO } from "./dtos/addBook.dto";

const fse = require('fs-extra')

@Controller('books')
export class BookController {

    constructor(private bookService: BookService) { }


    @Get('view-books')
    allBooks(@Query() query: any) {
        if (query.book_borrowed === "true") {
            return this.bookService.allBooks().filter(b => b.book_borrowed === true)
        } else {
            return this.bookService.allBooks()
        }
    }

    @Post('add-book')
    @UsePipes(new ValidationPipe())
    @HttpCode(HttpStatus.CREATED)
    addBook(@Body() addBookDTO: AddBookDTO) {
        return this.bookService.addBook(addBookDTO)
    }
}
