import { createObjectIncludeProperties } from 'src/misc/create-object-from-class';
import { z } from 'zod';
import { Booklog } from '../book_log.entity';

const booklogCreateObject = createObjectIncludeProperties(new Booklog(), [
  'bookUUID',
  'studentuuid',
]);
// const boologCopyObject= createObjectIncludeProperties( new )

export const booklogSchema = z.object({
  [booklogCreateObject.studentuuid]: z.string().uuid(),
  [booklogCreateObject.bookUUID]: z.string(),
  barcode: z.string(),
});

export type TCreateBooklogDTO = z.infer<typeof booklogSchema>;
