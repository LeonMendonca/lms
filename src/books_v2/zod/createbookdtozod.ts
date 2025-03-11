import z from'zod'
import { createObjectOmitProperties } from "src/create-object-from-class";
import { BookTitle } from "../entity/books_v2.title.entity";
import { BookCopy } from '../entity/books_v2.copies.entity';
import { parse } from 'isbn3';

const createBookTitleObject = createObjectOmitProperties(new BookTitle(), ['availableCount','totalCount', 'updatedAt','createdAt','bookUUID','bookId']);
const createBookCopyObject = createObjectOmitProperties(new BookCopy(), ['bookCopyUUID','isArchived','isAvailable',]);

export const createBookSchema=z.object({

[createBookTitleObject.bookTitle]:z.string(),
[createBookTitleObject.bookAuthor]:z.string(),
[createBookTitleObject.nameOfPublisher]:z.string(),
[createBookTitleObject.placeOfPublication]:z.string(),
[createBookTitleObject.yearOfPublication]:z.string(),
[createBookTitleObject.edition]:z.string(),
[createBookTitleObject.isbn]:z.string().refine((isbn)=>{
    let isbnObject = parse(isbn)
    if(isbnObject) {
        console.log(isbnObject.isValid)
        return isbnObject.isValid;
    }
    return false;
}, { message: "Invalid isbn" }),

[createBookTitleObject.noPages]:z.string(),
[createBookTitleObject.noPreliminary]:z.string(),
[createBookTitleObject.subject]:z.string(),
[createBookTitleObject.department]:z.string(),
[createBookTitleObject.callNumber]:z.string(),
[createBookTitleObject.authorMark]:z.string(),
[createBookTitleObject.images]:z.string(),
[createBookTitleObject.additionalFields]:z.string().optional(),
[createBookTitleObject.description]:z.string().optional(),

//copy part 

[createBookCopyObject.sourceOfAcquisition]: z.string(),
[createBookCopyObject.dateOfAcquisition]: z.string(),
[createBookCopyObject.billNo]: z.string(),
[createBookCopyObject.language]: z.string(),
[createBookCopyObject.inventoryNumber]: z.string().optional(),
[createBookCopyObject.accessionNumber]: z.string(),
[createBookCopyObject.barcode]: z.string(),
[createBookCopyObject.itemType]: z.string(),
[createBookCopyObject.instituteId]: z.string().optional(),
[createBookCopyObject.createdBy]: z.string().optional(),
[createBookCopyObject.remarks]: z.string().optional(),
});

export type TCreateBookZodDTO=z.infer<typeof createBookSchema>;