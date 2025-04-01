import { z } from "zod";

export const periodicalCopyID = z.string().uuid();

export type TPeriodicalCopyIdDTO = z.infer<typeof periodicalCopyID>;