import { z } from "zod"
import { createObjectOmitProperties } from "src/misc/create-object-from-class"
import { InstituteConfig } from "../entity/institute_config.entity"

const updateInstitute = createObjectOmitProperties(new InstituteConfig(), ['instituteUUID', 'createdDate',  'isArchived', 'instituteAbbr'])

export const updateInstituteSchema = z.object({
    [updateInstitute.instituteId]: z.string(),
    [updateInstitute.instituteName]: z.string().optional(),
    [updateInstitute.instituteContactPerson]: z.string().optional(),
    [updateInstitute.landline]: z.string().optional(),
    [updateInstitute.instituteEmail]: z.string().optional(),
    [updateInstitute.mobile]: z.string().optional(),
    [updateInstitute.instituteAddress]: z.string().optional(),
    [updateInstitute.pincode]: z.string().optional(),
    [updateInstitute.state]: z.string().optional(),
    [updateInstitute.city]: z.string().optional(),
    [updateInstitute.websiteUrl]: z.string().optional(),
    [updateInstitute.author]: z.string().optional(),
    [updateInstitute.instituteLogo]: z.string().optional(),
    [updateInstitute.instituteHeader]: z.string().optional(),
    [updateInstitute.enableTabs]: z.boolean().optional(),
    [updateInstitute.darkMode]: z.boolean().optional(),
    [updateInstitute.visualization]: z.object({
        dashboard_card: z.boolean().optional(),
        report_cards: z.boolean().optional(),
    }).optional(),
})

export type TInstituteUpdateDTO = z.infer<typeof updateInstituteSchema>;
