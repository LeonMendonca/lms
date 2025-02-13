import { Injectable } from "@nestjs/common";

@Injectable({})
export class BookService {
    allBooks() {
        return { msg: "Viewing all the books" }
    }
    editBooks() {
        return { msg: "Create a new Book" }
    }
}