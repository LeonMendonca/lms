import { z } from 'zod';

export const booklogActionSchema = z.object({
  studentUuid: z.string(),
  barcode: z.string(),
  action: z.enum(['borrow', 'return', 'in_library'], { message: "Invalid action. Expected borrow | return | in_library" })
});

export type TCreateBooklogActionDTO = z.infer<typeof booklogActionSchema>;