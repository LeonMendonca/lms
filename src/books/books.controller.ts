import { Controller, Get, Post, Body } from "@nestjs/common";
import { BookService } from "./books.service";
import * as path from "path"
import { AddBookDTO } from "./dtos/addBook.dto";

const fse = require('fs-extra')

@Controller('books')
export class BookController {
    private readonly filePath = path.resolve(__dirname, '../data/books.json')

    constructor(private bookService: BookService) { }

    @Get('view-books')
    allBooks() {
        return this.bookService.allBooks()
    }

    @Post('add-book')
    addBook(@Body() addBookDTO: AddBookDTO) {
        return this.bookService.addBook(addBookDTO)
    }
}
