import { createObjectIncludeProperties, createObjectOmitProperties } from 'src/misc/create-object-from-class';
import { z } from 'zod';
import { BookCopy } from '../entity/books_v2.copies.entity';

 const createBookCopyObject= createObjectOmitProperties(new BookCopy,['bookCopyUUID','updatedAt','createdAt','bookTitleUUID','instituteUUID','isAvailable','isArchived','bookCopyId'])
export const createObjectSchema = z.object({
  [createBookCopyObject.accessionNumber]:z.number(),
    [createBookCopyObject.barcode]:z.string(),
    [createBookCopyObject.billNo]:z.string(),
    [createBookCopyObject.copyAdditionalFields]:z.string(),
    [createBookCopyObject.copyDescription]:z.string(),
    [createBookCopyObject.copyImages]:z.string(),
    [createBookCopyObject.createdBy]:z.string(),
    [createBookCopyObject.dateOfAcquisition]:z.string(),
    [createBookCopyObject.inventoryNumber]:z.string(),
    [createBookCopyObject.itemType]:z.string(),
    [createBookCopyObject.language]:z.string(),
    [createBookCopyObject.remarks]:z.string(),
    [createBookCopyObject.sourceOfAcquisition]:z.string()

});

export type TUpdatebookcopyZodDTO = z.infer<typeof createObjectSchema>;
