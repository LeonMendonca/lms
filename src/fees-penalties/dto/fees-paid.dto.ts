import { z } from 'zod';

export const payFeeSchema = z.object({
  category: z.string().optional(),
  paymentMethod: z.string().optional(),
  daysDelayed: z.string().optional(),
  penaltyAmount: z.string().optional(),
  paidAmount: z.string().optional(),
  receiptNumber: z.string().optional(),
  paidAt: z.string().optional(),
  remarks: z.string().optional(),
  instituteUuid: z.string(),
  instituteName: z.string(),
});

export type TPayFeeDTO = z.infer<typeof payFeeSchema>;
