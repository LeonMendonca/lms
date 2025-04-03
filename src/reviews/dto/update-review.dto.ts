import { createObjectOmitProperties } from 'src/misc/create-object-from-class';
import { Review } from '../entities/review.entity';
import { z } from 'zod';

let reviewUpdateObject = createObjectOmitProperties(new Review(), [
  'reviewUUID',
  'bookUUID',
  'studentId',
  'isApproved',
  'isArchived',
  'createdAt',
  'updatedAt',
]);

export const updateReviewSchema = z.object({
  [reviewUpdateObject.starRating]: z
    .number({
      message: 'Department is required',
    })
    .optional(),

  [reviewUpdateObject.reviewText]: z.string(),
});

export type TUpdateReviewDTO = z.infer<typeof updateReviewSchema>;