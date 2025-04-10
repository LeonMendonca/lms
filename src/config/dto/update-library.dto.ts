import { z } from 'zod';

const notificationSchema = z.object({
  bookBorrowing: z.boolean(),
  bookReturning: z.boolean(),
  checkIn: z.boolean(),
  checkOut: z.boolean(),
  penalties: z.boolean(),
});

export const updateLibrarySchema = z.object({
  maxBooksStudent: z.number().optional(),
  maxBooksStaff: z.number().optional(),
  maxDaysStudent: z.number().optional(),
  maxDaysStaff: z.number().optional(),
  lateFeesPerDay: z.number().optional(),
  openingHour: z.string().optional(),
  closingHour: z.string().optional(),
  emailNotificationStudent: notificationSchema.optional(),
  emailNotificationAdmin: notificationSchema.optional(),
});

export type TUpdateLibraryDTO = z.infer<typeof updateLibrarySchema>;
