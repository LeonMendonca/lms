import { z } from 'zod';

export const userCredZodSchema = z.object({
  email: z.string().nonempty(),
  password: z.string().min(8, { message: 'Minimum password length 8' }),
});

export type TUserCredZodType = z.infer<typeof userCredZodSchema>;
