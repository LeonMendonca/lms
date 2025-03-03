import { z } from 'zod';
import { Students } from '../students.entity';
import { createObjectOmitProperties } from '../../create-object-from-class';

let studentCreateObject = createObjectOmitProperties(new Students(), [
  'studentUUID',
  'studentId',
  'count',
  'isArchived',
]);

export const createStudentSchema = z
  .object({
    [studentCreateObject.email]: z.string().email(),

    [studentCreateObject.password]: z.string(),

    //doesn't include in Class, but required for password validation
    confirm_password: z.string(),

    [studentCreateObject.dateOfBirth]: z.string().date(),

    [studentCreateObject.gender]: z.enum(['male', 'female']),

    [studentCreateObject.address]: z
      .string()
      .min(1, 'Address is required')
      .max(200, 'Address must be less than 200 characters'),

    [studentCreateObject.rollNo]: z.number().refine(
      (r_num) => {
        return r_num > 0 && r_num <= 10000;
      },
      {
        message: 'Not a valid RollNo',
      },
    ),

    [studentCreateObject.studentName]: z
      .string()
      .min(1, 'Full name is required')
      .max(100, 'Full name must be less than 100 characters'),

    [studentCreateObject.yearOfAdmission]: z.coerce
      .number()
      .min(1999)
      .max(new Date().getFullYear()),

    [studentCreateObject.phoneNo]: z.string().refine(
      (phno) => {
        return !isNaN(Number(phno)) && phno.length === 10;
      },
      {
        message: 'Not a valid Phone number number',
      },
    ),
    [studentCreateObject.department]: z.string({
      message: 'Department requires it or electrical',
    }),

    [studentCreateObject.instituteName]: z.string().min(2),

    [studentCreateObject.instituteId]: z.string().uuid(),
  })
  .refine(
    (zod) => {
      return zod.password === zod.confirm_password;
    },
    { message: "Password doesn't match" },
  );

export type TCreateStudentDTO = z.infer<typeof createStudentSchema>;
