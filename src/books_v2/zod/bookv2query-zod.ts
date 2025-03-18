import { createObjectIncludeProperties } from 'src/misc/create-object-from-class';
import { parse } from "isbn3";
import { z } from 'zod';

import { BookCopy } from "../entity/books_v2.copies.entity";
import { BookTitle } from "../entity/books_v2.title.entity";

export const createBookCopyQuery = createObjectIncludeProperties(new BookTitle(), ['bookTitleId', 'isbn', 'bookTitle']);

export const bookQueryV2Schema = z.object({
    [createBookCopyQuery.bookTitleId]: z.string().optional(),
    [createBookCopyQuery.bookTitle]: z.string().optional(),
    [createBookCopyQuery.isbn]: z.string().refine(
        (isbn)=>{
            let isbnObject = parse(isbn)
            if(isbnObject) {
                return isbnObject.isValid;
            }
            return false;
        }, { message: "Invalid isbn" }
    ).optional(),
});

export type TbookQueryV2Validator = z.infer<typeof bookQueryV2Schema>