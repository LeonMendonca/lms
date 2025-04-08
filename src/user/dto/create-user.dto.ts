import { z } from 'zod';

export const createUserSchemaZod = z.object({
  username: z.string().nonempty(),
  email: z.string().email(),
  designation: z.string(),
  phone_no: z.string().nonempty(),
  instituteDetails: z.array(z.string()),
  password: z.string(),
});

export type TCreateUserDTO = z.infer<typeof createUserSchemaZod>;
