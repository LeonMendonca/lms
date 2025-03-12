import { createObjectOmitProperties } from 'src/misc/create-object-from-class'
import z from 'zod'
import { BookTitle } from '../entity/books_v2.title.entity'
import { parse } from 'isbn3';
import { BookCopy } from '../entity/books_v2.copies.entity';


const createBookTitleObject= createObjectOmitProperties(new BookTitle(),['bookUUID','availableCount','totalCount','updatedAt','createdAt','bookId'])
const createBookCopyObject = createObjectOmitProperties(new BookCopy(), ['bookCopyUUID','isArchived','isAvailable','bookCopyUUID','bookTitleUUID','createdBy','createdAt','updatedAt']);

export const isbnBookSchema = z.object({
    [createBookTitleObject.isbn]:z.string().refine((isbn)=>{
        let isbnObject = parse(isbn)
        if(isbnObject) {
            return isbnObject.isValid;
        }
    }, { message: "Invalid isbn" }),
}) 
export type TisbnBookZodDTO = z.infer<typeof isbnBookSchema>;