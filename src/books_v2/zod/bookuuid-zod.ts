import { z } from "zod";

export const bookUUIDZod = z.string().uuid();

export type TbookUUIDZod = z.infer<typeof bookUUIDZod>;