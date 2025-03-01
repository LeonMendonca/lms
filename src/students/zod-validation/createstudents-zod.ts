import { z } from 'zod';
import { Gender } from '../students.entity';
import { run } from 'node:test';

const GENDER: (keyof typeof Gender)[] = ['MALE', 'FEMALE'] as const;

export const createStudentSchema = z
  .object({
    email: z.string().email(),

    password: z.string(),

    confirm_password: z.string(),

    date_of_birth: z.string().date(),

    gender: z.enum(['male', 'female']),

    address: z
      .string()
      .min(1, 'Address is required')
      .max(200, 'Address must be less than 200 characters'),

    roll_no: z.number().refine(
      (r_num) => {
        return r_num > 0 && r_num <= 10000;
      },
      {
        message: 'Not a valid RollNo',
      },
    ),

    student_name: z
      .string()
      .min(1, 'Full name is required')
      .max(100, 'Full name must be less than 100 characters'),

    year_of_admission: z.coerce
      .number()
      .min(1999)
      .max(new Date().getFullYear()),

    phone_no: z.string().refine(
      (phno) => {
        return !isNaN(Number(phno)) && phno.length === 10;
      },
      {
        message: 'Not a valid Phone number number',
      },
    ),
    department: z.string({ message: 'Department requires it or electrical' }),

    institute_name: z.string().min(2),

    institute_id: z.string().uuid(),
  })
  .refine(
    (zod) => {
      return zod.password === zod.confirm_password;
    },
    { message: "Password doesn't match" },
  );

export type TCreateStudentDTO = z.infer<typeof createStudentSchema>;
