import { z } from 'zod';

export const updateInquirySchema = z.object({
  inquiryUuid: z.string(),
  type: z.string(),
});

export type TUpdateInquiryDTO = z.infer<typeof updateInquirySchema>;
