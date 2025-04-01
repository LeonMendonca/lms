import { createObjectIncludeProperties } from 'src/misc/create-object-from-class';
import { z } from 'zod';
import { BookTitle } from '../entity/books_v2.title.entity';

//Book Title UUID
 const createBookTitleObject= createObjectIncludeProperties(new BookTitle,['bookUUID'])
export const createObjectSchema = z.object({
  [createBookTitleObject.bookUUID]: z.string().uuid()
});

export type TRestoreZodDTO = z.infer<typeof createObjectSchema>;
