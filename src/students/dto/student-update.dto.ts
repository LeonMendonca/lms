import { z } from 'zod';

export const editStudentDto = z.object({
    firstName: z.string().optional(),
    middleName: z.string().optional(),
    lastName: z.string().optional(),
    courseName: z.string().optional(),
    mobileNumber: z.string().optional(),
    email: z.string().optional(),
    dateOfBirth: z.string().optional(),
    bloodGroup: z.string().optional(),
    gender: z.string().optional(),
    address: z.string().optional(),
    secPhoneNumber: z.string().optional(),
    terPhoneNumber: z.string().optional(),
    department: z.string().optional(),
    rollNo: z.string().optional(),
    yearOfAdmission: z.string().optional(),
    profileImage: z.string().optional(),
});

export type TEditStudentDTO = z.infer<typeof editStudentDto>;
