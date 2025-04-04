import { z } from 'zod';
import { user } from '../user.entity';
import { createObjectOmitProperties } from 'src/misc/create-object-from-class';

let userUpdateObject = createObjectOmitProperties(user, [
  'userUUID',
  'createdAt',
  'updatedAt',
]);

export const editUserSchemaZod = z.object({
  [userUpdateObject.name]: z.string().max(255).nonempty().optional(),
  [userUpdateObject.email]: z.string().email().max(255).optional(),
  [userUpdateObject.phone_no]: z.string().nonempty().optional(),
  [userUpdateObject.address]: z.string().nonempty().optional(),
  [userUpdateObject.institute_details]: z
    .object({
      institute_uuid: z.string().uuid().nonempty(),
      institute_name: z.string().nonempty(),
      institute_logo: z.string().nonempty(),
      institute_header: z.string().nonempty(),
    })
    .array()
    .optional(),
});

export type TEditUserDTO = z.infer<typeof editUserSchemaZod>;
