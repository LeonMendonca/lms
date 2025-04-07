import { z } from 'zod';
import { Booklog_v2 } from 'src/books_v2/entity/book_logv2.entity';

export const booklogV2Schema = z.object({
  student_id: z.string(),
  book_copy_id: z.string(),
  // barcode: z.string(),
  action: z.enum(['borrow', 'return', 'in_library'], { message: "Invalid action. Expected borrow | return | in_library" })
});

export type TCreateBooklogV2DTO = z.infer<typeof booklogV2Schema>;