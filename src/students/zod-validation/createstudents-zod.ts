import { z } from 'zod';

export const createStudentSchema = z.object({
  email: z.string().email(),

  address: z
    .string()
    .min(1, 'Address is required')
    .max(200, 'Address must be less than 200 characters'),

  full_name: z
    .string()
    .min(1, 'Full name is required')
    .max(100, 'Full name must be less than 100 characters'),

  phone_no: z.string().refine(
    (phno) => {
      return !isNaN(Number(phno)) && phno.length === 10;
    },
    {
      message: 'Not a valid Phone number number',
    },
  ),
  department: z.string({ message: 'Department requires it or electrical' }),

  institute_id: z.string().uuid(),
});

export type TCreateStudentDTO = z.infer<typeof createStudentSchema>;
