import { createObjectIncludeProperties } from 'src/misc/create-object-from-class';
import { z } from 'zod';
import { student } from '../students.entity';

export const createStudentQuery = createObjectIncludeProperties(student, [
  'studentUUID',
  'studentId',
]);

export const studentQuerySchema = z.object({
  [createStudentQuery.studentId]: z.string(),
  [createStudentQuery.studentUUID]: z.string().uuid().optional(),
});

export type TStudentQueryValidator = z.infer<typeof studentQuerySchema>;
