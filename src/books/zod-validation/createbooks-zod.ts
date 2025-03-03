import { z } from 'zod';
import { createObjectOmitProperties } from '../../create-object-from-class';
import { Books } from '../books.entity';

const createBookObject = createObjectOmitProperties(new Books(), ['bookUUID']);

export const createBookSchema = z.object({
  [createBookObject.bookTitle]: z.string(),
  [createBookObject.bookAuthor]: z.string(),
  [createBookObject.nameOfPublisher]: z.string(),
  [createBookObject.placeOfPublication]: z.string(),
  [createBookObject.yearOfPublication]: z.string().date(),
  [createBookObject.language]: z.string(),
  [createBookObject.edition]: z.string(),
  [createBookObject.isbn]: z.string(),
  [createBookObject.noOfPages]: z.number(),
  [createBookObject.noOfPreliminaryPages]: z.number(),
  [createBookObject.subject]: z.string(),
  [createBookObject.department]: z.string(),
  [createBookObject.callNumber]: z.string().refine(
    (call_number) => {
      return !isNaN(Number(call_number)) && call_number.length === 10;
    },
    { message: 'Not a valid phone number' },
  ),
  [createBookObject.authorMark]: z.string(),
  [createBookObject.sourceOfAcquisition]: z.string(),
  [createBookObject.dateOfAcquisition]: z.string().date(),
  [createBookObject.billNo]: z.number(),
  [createBookObject.inventoryNumber]: z.number(),
  [createBookObject.accessionNumber]: z.number(),
  [createBookObject.barcode]: z.string(),
  [createBookObject.itemType]: z.string(),
  [createBookObject.instituteId]: z.string().uuid(),
});

export type TCreateBookDTO = z.infer<typeof createBookSchema>;
