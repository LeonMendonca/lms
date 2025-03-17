import { createObjectIncludeProperties, createObjectOmitProperties } from 'src/misc/create-object-from-class'
import z from 'zod'
import { VisitLog } from '../visitlog.entity';
import { Students } from '../students.entity';


const createVisitlog= createObjectIncludeProperties(new Students(),['studentId'])

export const visitlog = z.object({
 [createVisitlog.studentId]:z.string()
}) 
export type TVisit_log = z.infer<typeof visitlog>;