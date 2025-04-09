import { z } from 'zod';

export const studentVisitDTO = z.object({
    studentUuid: z.string().optional(),
    studentId: z.string().optional(),
});

export type TStudentVisitDTO = z.infer<typeof studentVisitDTO>;
