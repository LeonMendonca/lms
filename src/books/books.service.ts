import { Injectable } from "@nestjs/common";
import * as path from 'path'

const fse = require('fs-extra')

@Injectable({})
export class BookService {

    private filePath = path.join(process.cwd(), 'src', 'books', 'data', 'books.json')

    allBooks(): any {
        const fileData = fse.readFileSync(this.filePath, 'utf8')
        return JSON.parse(fileData)
    }

    addBook(newBook: any) {
        const books = this.allBooks()

        const maxId = books.length > 0 ? books.length : 0;
        newBook.book_id = maxId + 1

        books.push(newBook)
        fse.writeFileSync(this.filePath, JSON.stringify(books, null, 2), 'utf8')
        return { msg: "Book Added Successfully!" }
    }
}