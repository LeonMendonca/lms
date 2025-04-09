import { z } from 'zod';

export const updateReviewSchema = z.object({
  starRating: z.number(),
  rewiewText: z.string().optional(),
});

export type TUpdateReviewDTO = z.infer<typeof updateReviewSchema>;