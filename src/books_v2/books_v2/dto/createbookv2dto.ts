import { z } from 'zod';
import { BookTitle } from '../entity/books_v2.title.entity';
import { BookCopy } from '../entity/books_v2.copies.entity';
import { createObjectOmitProperties } from 'src/create-object-from-class';

const createBookTitleObject = createObjectOmitProperties(new BookTitle(), ['bookUUID', 'bookId', 'createdAt', 'updatedAt', 'bookCopies', 'availableCount', 'totalCount', 'isArchived']);
const createBookCopyObject = createObjectOmitProperties(new BookCopy(), ['bookCopyUUID', 'updatedAt', 'createdAt'])

const createBookZodSchemaV2 = z.object({
    [createBookTitleObject.bookTitle]: z.string(),
    [createBookTitleObject.bookAuthor]: z.string(),
    [createBookTitleObject.authorMark]: z.string(),
    [createBookTitleObject.edition]: z.string(),
    [createBookTitleObject.nameOfPublisher]: z.string(),
    [createBookTitleObject.placeOfPublication]: z.string(),
    [createBookTitleObject.yearOfPublication]: z.string(),
    [createBookTitleObject.department]: z.string(),
    [createBookTitleObject.isbn]: z.string(),
    [createBookTitleObject.remarks]: z.string(),
    [createBookTitleObject.subject]: z.string(),
    [createBookTitleObject.description]: z.string(),
    [createBookTitleObject.createdBy]: z.string(),
    [createBookTitleObject.callNumber]: z.string(),
    [createBookTitleObject.images]: z.string(),
    [createBookTitleObject.additionalFields]: z.string(),

    [createBookCopyObject.accessionNumber]: z.string(),
    [createBookCopyObject.barcode]: z.string(),
    [createBookCopyObject.billNo]: z.string(),
    //[createBookCopyObject.]
})

//createBookObject.
//createBookObject2.d