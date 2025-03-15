import { createObjectIncludeProperties } from 'src/misc/create-object-from-class';
import { z } from 'zod';
import { Booklog_v2 } from 'src/books_v2/entity/book_logv2.entity';

const booklogCreateObject = createObjectIncludeProperties(new Booklog_v2(), [
  'bookCopyUUID',
  'borrowerId',
]);
// const boologCopyObject= createObjectIncludeProperties( new )

export const booklogV2Schema = z.object({
  [booklogCreateObject.borrowerId]: z.string().uuid(),
  [booklogCreateObject.bookCopyUUID]: z.string(),
  barcode: z.string(),
});

export type TCreateBooklogV2DTO = z.infer<typeof booklogV2Schema>;