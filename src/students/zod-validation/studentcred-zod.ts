import { z } from 'zod';

export const studentCredZodSchema = z.object({
  email_or_student_id: z.string().nonempty(),
  password: z.string().min(8, { message: 'Minimum password length 8' }),
});

export type TStudentCredZodType = z.infer<typeof studentCredZodSchema>;
