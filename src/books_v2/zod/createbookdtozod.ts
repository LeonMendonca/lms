import z from'zod'
import { createObjectOmitProperties } from "src/misc/create-object-from-class";
import { BookTitle } from "../entity/books_v2.title.entity";
import { BookCopy } from '../entity/books_v2.copies.entity';
import { parse } from 'isbn3';

const createBookTitleObject = createObjectOmitProperties(new BookTitle(), ['availableCount','totalCount', 'updatedAt','createdAt','bookUUID']);
const createBookCopyObject = createObjectOmitProperties(new BookCopy(), ['bookCopyUUID','isArchived','isAvailable', 'bookId', 'updatedAt', 'createdAt']);

export const createBookSchema=z.object({
    [createBookTitleObject.bookTitle]:z.string(),
    [createBookTitleObject.bookAuthor]:z.string(),
    [createBookTitleObject.nameOfPublisher]:z.string(),
    [createBookTitleObject.placeOfPublication]:z.string(),
    [createBookTitleObject.yearOfPublication]:z.string().date(),
    [createBookTitleObject.edition]:z.string(),
    [createBookTitleObject.isbn]:z.string().refine((isbn)=>{
        let isbnObject = parse(isbn)
        if(isbnObject) {
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
    [createBookTitleObject.images]:z.array(z.string()).optional(),
    [createBookTitleObject.additionalFields]:z.any().optional(),
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
    [createBookCopyObject.instituteUUID]: z.string().uuid().optional(),
    [createBookCopyObject.createdBy]: z.string().uuid().optional(),
    [createBookCopyObject.remarks]: z.array(z.string()).optional(),
});

export type TCreateBookZodDTO = z.infer<typeof createBookSchema>;