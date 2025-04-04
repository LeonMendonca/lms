import { z } from "zod"
import { createObjectOmitProperties } from "src/misc/create-object-from-class"
import { InstituteConfig } from "../entity/institute_config.entity"

const createInstitute = createObjectOmitProperties(new InstituteConfig(), ['instituteUUID', 'instituteId', 'instituteAbbr','createdDate', 'isArchived'])

export const createInstituteSchema = z.object({
    [createInstitute.instituteName]: z.string(),
    [createInstitute.instituteContactPerson]: z.string().optional(),
    [createInstitute.landline]: z.string().optional(),
    [createInstitute.instituteEmail]: z.string(),
    [createInstitute.mobile]: z.string().min(10),
    [createInstitute.instituteAddress]: z.string(),
    [createInstitute.pincode]: z.string(),
    [createInstitute.state]: z.string(),
    [createInstitute.city]: z.string(),
    [createInstitute.websiteUrl]: z.string(),
    [createInstitute.author]: z.string(),
    [createInstitute.instituteLogo]: z.string(),
    [createInstitute.instituteHeader]: z.string()
})

export type TInstituteDTO = z.infer<typeof createInstituteSchema>;
