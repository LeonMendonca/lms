import { createObjectOmitProperties } from "src/create-object-from-class";
import { z } from "zod";
import { BookMiniCopies } from "../entity/bookm-copies.entity";

const createObjectBookBody = createObjectOmitProperties(new BookMiniCopies(), ['bookCopiesUUID'])

export const bookmZodSchema = z.object({
  type: z.literal('type-book'),
  [createObjectBookBody.bookTitle]: z.string(),
  [createObjectBookBody.bookAuthor]: z.string(),
  [createObjectBookBody.isbn]: z.string(),
});

export type TbookmZodSchema = z.infer<typeof bookmZodSchema>
