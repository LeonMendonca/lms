import { z } from 'zod';

export const studentUuidZod = z.string();

export type TStudentUuidZod = z.infer<typeof studentUuidZod>;
