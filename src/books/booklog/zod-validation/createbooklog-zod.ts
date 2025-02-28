import { z } from 'zod';

export const createBooklogSchema = z.object({
book_uuid :z.string(),
book_title:z.string(),
student_id:z.string(),
department:z.string(),
borrowed_by:z.string()
});
export type TCreateBooklogDTO = z.infer<typeof createBooklogSchema>;