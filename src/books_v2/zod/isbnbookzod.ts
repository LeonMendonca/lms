import { z } from 'zod';
import { parse } from 'isbn3';

export const isbnBookSchema = z.object({
  isbn: z.string().refine((isbn)=>{
      let isbnObject = parse(isbn)
      if(isbnObject) {
          return isbnObject.isValid;
      }
  }, { message: "Invalid isbn" }),
});

export type TisbnBookZodDTO = z.infer<typeof isbnBookSchema>;
