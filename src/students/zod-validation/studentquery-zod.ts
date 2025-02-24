import { z } from 'zod';

export const studentQuerySchema = z.object({
  student_id: z.string().uuid().optional(),
  email: z.string().email().optional(),
  phone_no: z.string().length(10, { message:'Must be a valid Phone no' }).optional(),
});

export type TStudentQueryValidator = z.infer<typeof studentQuerySchema>;
