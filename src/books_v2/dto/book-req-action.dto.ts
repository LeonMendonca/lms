import { z } from 'zod';

export const requestActionSchema = z.object({
  reason: z.string().optional(),
  requestId: z.string(),
  status: z.literal('approved').or(z.literal('rejected')),
});

export type TRequestActionDTO = z.infer<typeof requestActionSchema>;
