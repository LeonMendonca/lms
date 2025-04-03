import { z } from "zod"
import { createObjectOmitProperties } from "src/misc/create-object-from-class"
import { InstituteConfig } from "../entity/institute_config.entity"

const updateInstitute = createObjectOmitProperties(new InstituteConfig(), ['createdDate', 'libraryRuleId', 'isArchived'])

export const updateInstituteSchema = z.object({
    [updateInstitute.instituteId]: z.string(),
    [updateInstitute.instituteName]: z.string().optional(),
    [updateInstitute.instituteEmail]: z.string().optional(),
    [updateInstitute.institutePhoneNumber]: z.string().min(10).optional(),
    [updateInstitute.author]: z.string().optional(),
    [updateInstitute.instituteLogo]: z.string().optional()
})

export type TInstituteUpdateDTO = z.infer<typeof updateInstituteSchema>;
