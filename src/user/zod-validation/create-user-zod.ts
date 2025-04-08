// import { z } from 'zod';
// import { DesignationEnum, user } from '../entity/user.entity';
// import { createObjectOmitProperties } from 'src/misc/create-object-from-class';

// let userCreateObject = createObjectOmitProperties(user, [
//   'userUUID',
//   'createdAt',
//   'updatedAt',
// ]);

// export const createUserSchemaZod = z.object({
//   [userCreateObject.name]: z.string().max(255).nonempty(),
//   [userCreateObject.email]: z.string().email().max(255),
//   [userCreateObject.phone_no]: z.string().nonempty(),
//   [userCreateObject.designation]: z.enum([
//     DesignationEnum.LIBRARIAN,
//     DesignationEnum.ASSISTANT,
//     DesignationEnum.RECEPTIONIST,
//   ]),
//   [userCreateObject.institute_details]: z
//     .object({
//       institute_uuid: z.string().uuid().nonempty(),
//       institute_name: z.string().nonempty(),
//       institute_logo: z.string().nonempty(),
//       institute_header: z.string().nonempty(),
//     })
//     .array(),
//   [userCreateObject.address]: z.string().nonempty(),
//   [userCreateObject.password]: z.string().min(8).max(255),
// });

// export type TCreateUserDTO = z.infer<typeof createUserSchemaZod>;
