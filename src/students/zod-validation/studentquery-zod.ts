import { createObjectIncludeProperties } from 'src/misc/create-object-from-class';
import { z } from 'zod';
import { Students } from '../students.entity';

export const createStudentQuery = createObjectIncludeProperties(new Students(), ['studentUUID', 'studentId'])

export const studentQuerySchema = z.object({
  [createStudentQuery.studentId]: z.string().min(10, { message: "Not a valid Student ID" }).optional(),
  [createStudentQuery.studentUUID]: z.string().uuid().optional(),
});

export type TStudentQueryValidator = z.infer<typeof studentQuerySchema>;
