import { z } from 'zod';

export const requestSchema = z.object({
  bookCopyId: z.string(),
  barcode: z.string(),
  requestType: z.string(),
  instituteUuid: z.string(),
  instituteName: z.string(),
});

export type TRequestDTO = z.infer<typeof requestSchema>;
