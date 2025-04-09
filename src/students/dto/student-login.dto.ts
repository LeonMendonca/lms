import { z } from 'zod';

export const studentCredDTO = z.object({
  email: z.string().nonempty(),
  password: z.string(),
});

export type TStudentCredDTO = z.infer<typeof studentCredDTO>;
