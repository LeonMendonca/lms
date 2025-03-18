import { createObjectIncludeProperties, createObjectOmitProperties } from 'src/misc/create-object-from-class'
import z from 'zod'
import { VisitLog } from '../visitlog.entity';


const createVisitlog= createObjectIncludeProperties(new VisitLog(),['student_ID','action'])

export const visitlog = z.object({
 [createVisitlog.student_ID]:z.string(),
 [createVisitlog.action]:z.string()
}) 
export type TVisit_log = z.infer<typeof visitlog>;