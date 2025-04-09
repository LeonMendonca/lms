import { z } from 'zod';

export const createInquirySchema = z.object({
  studentUuid: z.string(),
  inquiryType: z.string(),
  inquiryReqUuid: z.string(),
});

export type TCreateInquiryDTO = z.infer<typeof createInquirySchema>;
