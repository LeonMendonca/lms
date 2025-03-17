import { z } from 'zod';
import { Booklog_v2 } from 'src/books_v2/entity/book_logv2.entity';

export const booklogV2Schema = z.object({
  student_id: z.string().min(10),
  book_copy_id: z.string(),
  barcode: z.string(),
});

export type TCreateBooklogV2DTO = z.infer<typeof booklogV2Schema>;