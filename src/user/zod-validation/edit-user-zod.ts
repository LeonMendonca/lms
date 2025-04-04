import { z } from 'zod';
import { DesignationEnum, user } from '../user.entity';
import { createObjectOmitProperties } from 'src/misc/create-object-from-class';

let userCreateObject = createObjectOmitProperties(user, [
  'userUUID',
  'createdAt',
  'updatedAt',
]);

export const editUserSchemaZod = z.object({
  [userCreateObject.name]: z.string().max(255).nonempty().optional(),
  [userCreateObject.email]: z.string().email().max(255).optional(),
  [userCreateObject.phone_no]: z.string().nonempty().optional(),
  [userCreateObject.address]: z.string().nonempty().optional(),
});

export type TEditUserDTO = z.infer<typeof editUserSchemaZod>;
