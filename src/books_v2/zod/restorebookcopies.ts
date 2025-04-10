// @ts-nocheck
import { createObjectIncludeProperties } from 'src/misc/create-object-from-class';
import { z } from 'zod';
import { BookCopy } from '../entity/books_v2.copies.entity';

//Book Title UUID
 const createBookTitleObject= createObjectIncludeProperties(new BookCopy,['bookCopyUUID'])
export const createObjectSchema = z.object({
  [createBookTitleObject.bookCopyUUID]: z.string().uuid()
});

export type TRestorecopybookZodDTO = z.infer<typeof createObjectSchema>;
