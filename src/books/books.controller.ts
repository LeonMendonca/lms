import { Controller, Get, Post, Body } from "@nestjs/common";
import { BookService } from "./books.service";
import * as fs from "fs"
import * as path from "path"

const fse = require('fs-extra')

interface BookDTO {
    bid: number,
    bname: string,
    bauthor: string,
    bpublisher: string,
    bpyear: Date
}


@Controller('books')
export class BookController {
    private readonly filePath = path.resolve(__dirname, '../data/books.json')

    constructor(private bookService: BookService) { }

    @Get('view-books')
    allBooks() {
        try {
            const fileData = fse.readFileSync(this.filePath, 'utf8');
            const books = JSON.parse(fileData);
            return { books };
        } catch (error) {
            console.error("Error reading books.json:", error);
            return { msg: "Failed to fetch books", error: error.message };
        }
    }

    @Post('edit-books')
    async editBooks(@Body() newBook: BookDTO) {
        try {
            let books: BookDTO[] = []
            if (await fse.pathExists(this.filePath)) {
                const fileData = await fse.readFile(this.filePath, 'utf8')
                books = fileData ? JSON.parse(fileData) : []
            }
            books.push(newBook)
            await fse.writeFile(this.filePath, JSON.stringify(books, null, 2))
            console.log("Book Added Successfully!")
        } catch (error) {
            console.error("Error Adding Book: ", error)
            return { msg: "Error Adding Book", error: error.message }
        }
    }
    // editBooks(@Body() requestData: BookDTO) {
    //     const newBook: BookDTO = { ...requestData }
    //     let books: BookDTO[] = []

    //     if (fse.pathExists(this.filePath)) {
    //         const fileData = fse.readJson(this.filePath)
    //     }
    //     fse.writeJson(this.filePath, newBook, err => {
    //         if (err) return console.error(err)
    //         console.log("Successful!")
    //     })
    //     // fse.writeJsonSync(this.filePath, newBook)
    //     return { newBook }
    // }
}


