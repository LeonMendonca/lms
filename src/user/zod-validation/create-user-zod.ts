import { z } from 'zod';
import { DesignationEnum, user } from '../user.entity';
import { createObjectOmitProperties } from 'src/misc/create-object-from-class';

let userCreateObject = createObjectOmitProperties(user, [
  'userUUID',
  'createdAt',
  'updatedAt',
]);

export const UserSchemaZod = z.object({
  [userCreateObject.name]: z.string().max(255).nonempty(),
  [userCreateObject.email]: z.string().email().max(255),
  [userCreateObject.phone_no]: z.string().nonempty(),
  [userCreateObject.designation]: z.enum([
    DesignationEnum.LIBRARIAN,
    DesignationEnum.ASSISTANT,
    DesignationEnum.RECEPTIONIST
  ]),
  [userCreateObject.address]: z.string().nonempty(),
  [userCreateObject.password]: z.string().min(8).max(255),
});

export type TCreateUserDTO = z.infer<typeof UserSchemaZod>