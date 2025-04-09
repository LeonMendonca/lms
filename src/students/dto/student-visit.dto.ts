import { z } from 'zod';

export const studentVisitDTO = z.object({
    studentUuid: z.string(),
});

export type TStudentVisitDTO = z.infer<typeof studentVisitDTO>;
