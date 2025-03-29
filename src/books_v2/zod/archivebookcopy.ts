import { createObjectIncludeProperties } from 'src/misc/create-object-from-class';
import { z } from 'zod';
import { BookCopy } from '../entity/books_v2.copies.entity';

 const createBookCopyObject= createObjectIncludeProperties(new BookCopy,['bookCopyUUID'])
export const createObjectSchema = z.object({
  [createBookCopyObject.bookCopyUUID]: z.string().uuid()
});

export type TCopyarchiveZodDTO = z.infer<typeof createObjectSchema>;
