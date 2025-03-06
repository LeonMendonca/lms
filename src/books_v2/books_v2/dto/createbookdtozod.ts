import z from'zod'
import { createObjectIncludeProperties,createObjectOmitProperties } from "src/create-object-from-class";
import { BookTitle } from "../entity/books_v2.title.entity";

const createBookObject = createObjectOmitProperties(new BookTitle(), ['availableCount','totalCount']);

export const createBookTitleSchema=z.object({
[createBookObject.bookUUID]:z.string(),
[createBookObject.bookId]:z.string(),
[createBookObject.bookAuthor]:z.string(),
[createBookObject.nameOfPublisher]:z.string(),
[createBookObject.placeOfPublication]:z.string(),
[createBookObject.yearOfPublication]:z.string(),
[createBookObject.edition]:z.string(),
[createBookObject.isbn]:z.string(),
[createBookObject.subject]:z.string(),
[createBookObject.department]:z.string()
})