import { z } from 'zod';
import { Gender, Students } from '../students.entity';
import { createObjectOmitProperties } from '../../misc/create-object-from-class';

let studentCreateObject = createObjectOmitProperties(new Students(), [
  'studentUUID',
  'studentId',
  'isArchived',
  'createdAt',
  'updatedAt',
]);

export const createStudentSchema = z.object({
  [studentCreateObject.studentName]: z.string(),

  [studentCreateObject.department]: z.string({
    message: 'Department is required',
  }),

  [studentCreateObject.rollNo]: z.number(),

  [studentCreateObject.email]: z.string().email(),

  [studentCreateObject.phoneNo]: z.string(),

  [studentCreateObject.gender]: z.enum([Gender.MALE, Gender.FEMALE]),

  [studentCreateObject.instituteName]: z.string(),

  [studentCreateObject.instituteUUID]: z.string().uuid(),

  [studentCreateObject.yearOfAdmission]: z.coerce.number().optional(),

  [studentCreateObject.password]: z.string().optional(),

  [studentCreateObject.dateOfBirth]: z
    .string()
    .trim()
    .transform((val) => (val === '' ? null : val))
    .nullable()
    .refine((val) => val === null || !isNaN(Date.parse(val as string)), {
      message: 'Invalid date format',
    })
    .optional(),

  [studentCreateObject.address]: z
    .string()
    .min(1, 'Address is required')
    .max(200, 'Address must be less than 200 characters')
    .optional(),

  [studentCreateObject.imageField]: z.array(z.any()).optional(),
});

export type TCreateStudentDTO = z.infer<typeof createStudentSchema>;
