import {isValid, string, z} from 'zod'
import { createObjectIncludeProperties } from 'src/create-object-from-class'
import { Bookcount } from '../bookcount.entity'
import { parse } from 'isbn3';
import { createBookQuery } from 'src/books/zod-validation/bookquery-zod';
export const createBookcountQuery = createObjectIncludeProperties(new Bookcount(), [ 'isbn'])
// let a=ISBN.parse(createBookcountQuery.isbn);

// console.log(a?.isValid);

export const bookcountQuerySchema= z.object({
    // [createBookcountQuery.isbn]: z.string()
    [createBookcountQuery.isbn]: z.string().refine((isbn)=>{
        let isbnObject = parse(isbn)
        if(isbnObject) {
            return isbnObject.isValid;
        }
        return false;
    }, { message: "Invalid isbn" })
})
export type TcreatebookcountQueryValidator = z.infer<typeof bookcountQuerySchema>;





