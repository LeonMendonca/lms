import { z } from 'zod';

export const studentUuidZod = z.string().uuid();

export type TStudentUuidZod = z.infer<typeof studentUuidZod>;
