import { z } from "zod"
import { createObjectOmitProperties } from "src/misc/create-object-from-class"
import { InstituteConfig } from "../entity/institute_config.entity"
import { create } from "domain"

const createInstitute = createObjectOmitProperties(new InstituteConfig(), ['instituteUUID', 'instituteId', 'instituteAbbr','createdDate', 'isArchived'])

export const createInstituteSchema = z.object({
    [createInstitute.instituteName]: z.string(),
    [createInstitute.instituteContactPerson]: z.string().optional(),
    [createInstitute.landline]: z.string().optional(),
    [createInstitute.instituteEmail]: z.string().optional(),
    [createInstitute.mobile]: z.string().min(10).optional(),
    [createInstitute.instituteAddress]: z.string().optional(),
    [createInstitute.pincode]: z.string().optional(),
    [createInstitute.state]: z.string().optional(),
    [createInstitute.city]: z.string().optional(),
    [createInstitute.websiteUrl]: z.string().optional(),
    [createInstitute.author]: z.string().optional(),
    [createInstitute.instituteLogo]: z.string().optional(),
    [createInstitute.instituteHeader]: z.string().optional(),
    [createInstitute.visualization]: z.object({
        dashboard_card: z.boolean().default(false),
        report_cards: z.boolean().default(false)
    }),
    user_uuid: z.string().uuid().optional()
})

export type TInstituteDTO = z.infer<typeof createInstituteSchema>;
