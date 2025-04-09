import { z } from 'zod';

export const createUserSchemaZod = z.object({
  firstName: z.string().nonempty(),
  middleName: z.string().optional(),
  lastName: z.string().nonempty(),
  gender: z.string(),
  workEmail: z.string().email(),
  workPhone: z.string().nonempty(),
  password: z.string(),
  instituteUuid: z.array(z.string()),
  designation: z.string(),
});

export type TCreateUserDTO = z.infer<typeof createUserSchemaZod>;
