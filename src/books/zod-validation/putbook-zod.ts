import { z } from 'zod';
import { createObjectOmitProperties } from 'src/create-object-from-class';
import { Books } from '../books.entity';

const updateBookObject = createObjectOmitProperties(new Books(), ['bookUUID']);

export const editBookSchema = z.object({
  [updateBookObject.bookTitle]: z.string().optional(),
  [updateBookObject.bookAuthor]: z.string().optional(),
  [updateBookObject.nameOfPublisher]: z.string().optional(),
  [updateBookObject.placeOfPublication]: z.string().optional(),
  [updateBookObject.yearOfPublication]: z.string().date().optional(),
  [updateBookObject.language]: z.string().optional(),
  [updateBookObject.edition]: z.string().optional(),
  [updateBookObject.isbn]: z.string().optional(),
  [updateBookObject.noOfPages]: z.number().optional(),
  [updateBookObject.noOfPreliminaryPages]: z.number().optional(),
  [updateBookObject.subject]: z.string().optional(),
  [updateBookObject.department]: z.string().optional(),
  [updateBookObject.callNumber]: z
    .string()
    .refine(
      (call_number) => {
        return !isNaN(Number(call_number)) && call_number.length === 10;
      },
      { message: 'Not a valid phone number' },
    )
    .optional(),
  [updateBookObject.authorMark]: z.string().optional(),
  [updateBookObject.sourceOfAcquisition]: z.string().optional(),
  [updateBookObject.dateOfAcquisition]: z.string().date().optional(),
  [updateBookObject.billNo]: z.number().optional(),
  [updateBookObject.inventoryNumber]: z.number().optional(),
  [updateBookObject.accessionNumber]: z.number().optional(),
  [updateBookObject.barcode]: z.string().optional(),
  [updateBookObject.itemType]: z.string().optional(),
});

export type TEditBookDTO = z.infer<typeof editBookSchema>;
