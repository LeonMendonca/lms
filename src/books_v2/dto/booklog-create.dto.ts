import { z } from 'zod';

export const booklogActionSchema = z.object({
  barCode: z.string(),
  barcode: z.string(),
  action: z.enum(['borrowed', 'returned', 'in_library'], { message: "Invalid action. Expected borrow | return | in_library" })
});

export type TCreateBooklogActionDTO = z.infer<typeof booklogActionSchema>;