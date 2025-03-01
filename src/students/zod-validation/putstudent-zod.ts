import { z } from 'zod';

export const editStudentSchema = z.object({
  email: z.string().min(1).email().optional(),

  address: z
    .string()
    .min(1)
    .max(200, 'Address must be less than 200 characters')
    .optional(),

  student_name: z
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

  current_password: z.string().optional(),

  //new password
  password: z.string().optional(),

  //confirm new password
  confirm_password: z.string().optional(),

  roll_no: z.number().refine(
      (r_num) => {
        return r_num > 0 && r_num <= 10000;
      },
      {
        message: 'Not a valid RollNo',
      },
    ),

  date_of_birth: z.string().date(),

  gender: z.enum(['male', 'female']),

  year_of_admission: z.coerce
    .number()
    .min(1999)
    .max(new Date().getFullYear()),

}).refine((zod) => {
  return zod.password === zod.confirm_password;
}, {
  message: "Password doesn't match"
});

export type TEditStudentDTO = z.infer<typeof editStudentSchema>;
