import { z } from 'zod';
import { createObjectOmitProperties } from '../../misc/create-object-from-class';
import { Review } from '../entities/review.entity';

let reviewCreateObject = createObjectOmitProperties(new Review(), [
  'reviewUUID',
  'studentId',
  'isApproved',
  'isArchived',
  'createdAt',
  'updatedAt',
]);

export const createReviewSchema = z.object({
  [reviewCreateObject.bookUUID]: z.string().uuid(),

  [reviewCreateObject.starRating]: z
    .number({
      message: 'Department is required',
    })
    .optional(),

  [reviewCreateObject.reviewText]: z.string(),
});

export type TCreateReviewDTO = z.infer<typeof createReviewSchema>;
