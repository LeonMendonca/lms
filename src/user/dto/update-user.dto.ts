import { z } from 'zod';

export const editUserSchemaZod = z.object({
  username: z.string().nonempty(),
  email: z.string().email(),
  designation: z.string(),
  address: z.string().nonempty(),
  phone_no: z.string().nonempty(),
  instituteDetails: z.array(z.string()),
});

export type TEditUserDTO = z.infer<typeof editUserSchemaZod>;
