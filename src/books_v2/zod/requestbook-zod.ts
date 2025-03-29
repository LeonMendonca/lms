import { createObjectIncludeProperties } from "src/misc/create-object-from-class";
import { z } from "zod";
import { request_book } from "../entity/request-book.entity";

const createRequestBooklogObject = createObjectIncludeProperties(request_book, ['studentId', 'bookBarcode', 'requestType', 'requestId', 'status'])


export const requestBookZodIssue = z.object({
    [createRequestBooklogObject.studentId]: z.string(),
    [createRequestBooklogObject.bookBarcode]: z.string(),
    [createRequestBooklogObject.requestType]: z.literal('issue'),
});

export const requestBookZodReIssue = z.object({
    [createRequestBooklogObject.studentId]: z.string().nonempty(),
    [createRequestBooklogObject.bookBarcode]: z.string().nonempty(),
    [createRequestBooklogObject.requestType]: z.literal('re-issue'),
    extended_period: z.number().min(1).max(7)
});

export const requestBookZodIssueReIssueAR = z.object({
    [createRequestBooklogObject.requestId]: z.string().nonempty(),
    [createRequestBooklogObject.status]: z.enum(['approved', 'rejected']),
    //when rejected, reason
    reject_reason: z.string().optional()
});

export type TRequestBookZodIssue = z.infer<typeof requestBookZodIssue>;
export type TRequestBookZodReIssue = z.infer<typeof requestBookZodReIssue>;

export type TRequestBookZodIssueReIssueAR = z.infer<typeof requestBookZodIssueReIssueAR>

//IF Same controllers needed
//export const requestBookZod = z.object({
//    [createRequestBooklogObject.studentId]: z.string(),
//    [createRequestBooklogObject.bookBarcode]: z.string(),
//    [createRequestBooklogObject.requestType]: z.enum(['issue', 're-issue']),
//    no_of_days_extended: z.number().min(1).max(7).optional()
//}).refine((z) => {
//    let requestType = z[createRequestBooklogObject.requestType];
//    if (requestType === 're-issue' && !z.no_of_days_extended) {
//        return false;
//    } else if (requestType === 'issue' && z.no_of_days_extended) {
//        return false;
//    } else {
//        return true;
//    }
//}, { message: 'no_of_days_extended is required with re-issue request type' });

//export type TRequestBookZod = z.infer<typeof requestBookZod>;