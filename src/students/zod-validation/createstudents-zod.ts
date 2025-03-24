import { z } from 'zod';
import { Gender, Students } from '../students.entity';
import { createObjectOmitProperties } from '../../misc/create-object-from-class';

let GenderArr: readonly string[] = Object.keys(Gender);

let studentCreateObject = createObjectOmitProperties(new Students(), [
  'studentUUID',
  'studentId',
  'isArchived',
  'createdAt',
  'updatedAt',
]);

export const createStudentSchema = z.object({
  [studentCreateObject.email]: z.string().email(),

  [studentCreateObject.password]: z.string().optional(),

  [studentCreateObject.dateOfBirth]: z
    .string()
    .trim()
    .transform((val) => (val === '' ? null : val))
    .nullable()
    .optional()
    .refine((val) => val === null || !isNaN(Date.parse(val as string)), {
      message: 'Invalid date format',
    }),

  [studentCreateObject.gender]: z.enum([Gender.MALE, Gender.FEMALE]),

  [studentCreateObject.address]: z
    .string()
    .min(1, 'Address is required')
    .max(200, 'Address must be less than 200 characters')
    .optional(),

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
    .max(new Date().getFullYear())
    .optional(),

  [studentCreateObject.phoneNo]: z.string(),
  [studentCreateObject.department]: z.string({
    message: 'Department requires it or electrical',
  }),

  [studentCreateObject.instituteName]: z.string().min(2),

  [studentCreateObject.instituteUUID]: z.string().uuid().optional(),
  [studentCreateObject.imageField]: z.string().optional(),
});

export type TCreateStudentDTO = z.infer<typeof createStudentSchema>;
