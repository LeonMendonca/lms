import { createObjectIncludeProperties } from 'src/create-object-from-class';
import { z } from 'zod';
import { Students } from '../students.entity';

const createStudentQuery = createObjectIncludeProperties(new Students(), ['studentId', 'email', 'phoneNo'])

export const studentQuerySchema = z.object({
  [createStudentQuery.studentId]: z.string().optional(),
  [createStudentQuery.email]: z.string().email().optional(),
  [createStudentQuery.phoneNo]: z
    .string()
    .length(10, { message: 'Must be a valid Phone no' })
    .optional(),
});

export type TStudentQueryValidator = z.infer<typeof studentQuerySchema>;
