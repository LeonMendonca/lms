import { z } from 'zod';

export const createStudentSchema = z.object({
  firstName: z.string(),
  middleName: z.string().optional(),
  lastName: z.string(),
  courseName: z.string().optional(),
  mobileNumber: z.string(),
  email: z.string(),
  dateOfBirth: z.string().optional(),
  bloodGroup: z.string().optional(),
  gender: z.string().optional(),
  address: z.string().optional(),
  secPhoneNumber: z.string().optional(),
  terPhoneNumber: z.string().optional(),
  password: z.string().optional(),
  rollNo: z.string().optional(),
  instituteName: z.string(),
  department: z.string().optional(),
  instituteUuid: z.string(),
  yearOfAdmission: z.string().optional(),
  profileImage: z.string().optional(),
});

export type TCreateStudentDTO = z.infer<typeof createStudentSchema>;
