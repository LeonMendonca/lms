import { createObjectIncludeProperties } from 'src/misc/create-object-from-class';
import { z } from 'zod';
import { BookTitle } from '../entity/books_v2.title.entity';

//Book Title UUID
 const createBookTitleObject= createObjectIncludeProperties(new BookTitle,['bookTitleId'])
export const createObjectSchema = z.object({
  [createBookTitleObject.bookTitleId]: z.string().uuid()
});

export type TupdatearchiveZodDTO = z.infer<typeof createObjectSchema>;
