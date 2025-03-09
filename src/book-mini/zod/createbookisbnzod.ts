import { z } from "zod";
import { parse } from "isbn3";

export const isbnZod = z.object({
  type: z.literal('type-isbn'),
  isbn: z.string().refine((isbn) => {
    let result = parse(isbn);
    if(result) {
      return result.isValid;
    }
  }, { message: "Invalid ISBN format" })
});

export type TisbnZod = z.infer<typeof isbnZod>;
