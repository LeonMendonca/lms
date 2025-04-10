import { z } from 'zod';

export const createStudentSchema = z.object({
  firstName: z.string(),
  middleName: z.string().optional(),
  lastName: z.string(),
  department: z.string().optional(),
  rollNo: z.string().optional(),
  email: z.string(),
  mobileNumber: z.string(),
  gender: z.string().optional(),
  dateOfBirth: z.string().optional(),
  role: z.string().default('student'),
  address: z.string().optional(),
  bloodGroup: z.string().optional(),
  secPhoneNumber: z.string().optional(),
  terPhoneNumber: z.string().optional(),
  password: z.string().optional(),
  instituteName: z.string(),
  instituteUuid: z.string(),
  yearOfAdmission: z.string().optional(),
  profileImage: z.string().optional(),
  courseName: z.string().optional(),         
});

export type TCreateStudentDTO = z.infer<typeof createStudentSchema>;
