import { z } from 'zod';

export const loginUserSchemaZod = z.object({
  workEmail: z.string().nonempty(),
  password: z.string(),
});

export type TLoginUserDTO = z.infer<typeof loginUserSchemaZod>;
