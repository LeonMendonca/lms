import { createObjectIncludeProperties, createObjectOmitProperties } from 'src/misc/create-object-from-class';
import { z } from 'zod';
import { BookTitle } from '../entity/books_v2.title.entity';
import { parse } from 'isbn3';

 const createBookTitleObject= createObjectOmitProperties(new BookTitle,['isArchived','availableCount','bookUUID','bookTitleId','totalCount','updatedAt','createdAt','bookCopies'])
export const createObjectSchema = z.object({
  [createBookTitleObject.bookTitle]: z.string().uuid(),
  [createBookTitleObject.titleDescription]:z.string(),
  [createBookTitleObject.authorMark]:z.string(),
  [createBookTitleObject.bookAuthor]:z.string(),
  [createBookTitleObject.isbn]:z.string().refine((isbn)=>{
        let isbnObject = parse(isbn)
        if(isbnObject) {
            return isbnObject.isValid;
        }
    }, { message: "Invalid isbn" }),
[createBookTitleObject.callNumber]:z.string(),
[createBookTitleObject.department]:z.string(),
[createBookTitleObject.edition]:z.string(),
[createBookTitleObject.nameOfPublisher]:z.string(),
[createBookTitleObject.noPages]:z.number(),
[createBookTitleObject.noPreliminary]:z.number(),
[createBookTitleObject.placeOfPublication]:z.string(),
[createBookTitleObject.subject]:z.string(),
[createBookTitleObject.titleAdditionalFields]:z.string(),
[createBookTitleObject.titleImages]:z.string(),
[createBookTitleObject.yearOfPublication]:z.string()


});

export type TUpdatebookZodDTO = z.infer<typeof createObjectSchema>;
