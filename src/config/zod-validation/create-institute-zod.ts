import { z } from "zod"
import { createObjectOmitProperties } from "src/misc/create-object-from-class"
import { InstituteConfig } from "../entity/institute_config.entity"

const createInstitute = createObjectOmitProperties(new InstituteConfig(), ['instituteId', 'createdDate', 'isArchived'])

export const createInstituteSchema = z.object({
    // [createInstitute.createdDate]: z.string().date(),
    [createInstitute.instituteName]: z.string(),
    [createInstitute.instituteEmail]: z.string(),
    [createInstitute.institutePhoneNumber]: z.string().min(10),
    [createInstitute.author]: z.string(),
    [createInstitute.instituteLogo]: z.string()
})

export type TInstituteDTO = z.infer<typeof createInstituteSchema>;
