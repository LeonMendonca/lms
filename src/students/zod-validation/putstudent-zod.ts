import { z } from 'zod';
import { createObjectOmitProperties } from '../../misc/create-object-from-class';
import { Students } from '../students.entity';

let studentUpdateObject = createObjectOmitProperties(new Students(), [
  'studentUUID',
  'studentId',
  'isArchived',
]);

export const editStudentSchema = z
  .object({
    [studentUpdateObject.email]: z.string().min(1).email().optional(),

    [studentUpdateObject.address]: z
      .string()
      .min(1)
      .max(200, 'Address must be less than 200 characters')
      .optional(),

    [studentUpdateObject.studentName]: z
      .string()
      .min(1)
      .trim()
      .max(100, 'Full name must be less than 100 characters')
      .optional(),

    [studentUpdateObject.phoneNo]: z
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
    [studentUpdateObject.department]: z
      .string({ message: 'Department required' })
      .min(1)
      .optional(),

    //doesn't include in Class, but required for Existing password valiation
    current_password: z.string().min(8).optional(),

    //password field in PG Database will be updated, if current_password is true
    [studentUpdateObject.password]: z.string().min(8).optional(),

    //doesn't include in Class, but required for New Password confirmation
    confirm_password: z.string().min(8).optional(),

    [studentUpdateObject.rollNo]: z
      .number()
      .refine(
        (r_num) => {
          return r_num > 0 && r_num <= 10000;
        },
        {
          message: 'Not a valid RollNo',
        },
      )
      .optional(),

    [studentUpdateObject.dateOfBirth]: z.string().date().optional(),

    [studentUpdateObject.gender]: z.enum(['male', 'female']).optional(),

    [studentUpdateObject.yearOfAdmission]: z.coerce
      .number()
      .min(1999)
      .max(new Date().getFullYear())
      .optional(),
  })
  .refine(
    (zod) => {
      return zod.password === zod.confirm_password;
    },
    {
      message: "Password doesn't match",
    },
  );

export type TEditStudentDTO = z.infer<typeof editStudentSchema>;
