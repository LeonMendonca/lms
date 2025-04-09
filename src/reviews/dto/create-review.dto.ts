import { z } from 'zod';

export const createReviewSchema = z.object({
  bookUuid: z.string().uuid(),
  starRating: z.number(),
  reviewText: z.string().optional(),
});

export type TCreateReviewDTO = z.infer<typeof createReviewSchema>;
