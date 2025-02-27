import { z } from 'zod';

export const editStudentSchema = z.object({
  email: z.string().min(1).email().optional(),

  address: z
    .string()
    .min(1)
    .max(200, 'Address must be less than 200 characters')
    .optional(),

  full_name: z
    .string()
    .min(1)
    .trim()
    .max(100, 'Full name must be less than 100 characters')
    .optional(),

  phone_no: z
    .string()
    .refine(
      (phno) => {
        return !isNaN(Number(phno)) && phno.length === 10;
      },
      {
        message: 'Not a valid Phone number number',
      },
    )
    .optional(),
  department: z
    .string({ message: 'Department requires it or electrical' })
    .min(1)
    .optional(),
});

export type TEditStudentDTO = z.infer<typeof editStudentSchema>;
