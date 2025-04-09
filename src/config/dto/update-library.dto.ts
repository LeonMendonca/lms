import { z } from 'zod';

export const updateLibrarySchema = z.object({
  maxBooksStudent: z.number().optional(),
  maxBooksStaff: z.number().optional(),
  maxDaysStudent: z.number().optional(),
  maxDaysStaff: z.number().optional(),
  lateFeesPerDay: z.number().optional(),
  openingHour: z.string().optional(),
  closingHour: z.string().optional(),
  emailNotifications: z.boolean().optional(),
});

export type TUpdateLibraryDTO = z.infer<typeof updateLibrarySchema>;
