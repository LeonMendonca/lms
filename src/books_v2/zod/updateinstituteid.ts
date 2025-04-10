// @ts-nocheck
import { createObjectIncludeProperties, createObjectOmitProperties } from 'src/misc/create-object-from-class';
import { z } from 'zod';
import { BookTitle } from '../entity/books_v2.title.entity';
import { parse } from 'isbn3';
import { BookCopy } from '../entity/books_v2.copies.entity';

 const createBookcopyObject= createObjectIncludeProperties(new BookCopy,['instituteUUID','bookCopyUUID'])
export const createObjectSchema = z.object({
 [createBookcopyObject.bookCopyUUID]:z.string().uuid(),
 [createBookcopyObject.instituteUUID]:z.string().uuid()

});

export type TUpdateInstituteZodDTO = z.infer<typeof createObjectSchema>;
