import { z } from "zod"
import { JournalsCopy } from "../entity/journals_copy.entity"
import { createObjectOmitProperties } from "src/misc/create-object-from-class"

const updateJournalCopyObject = createObjectOmitProperties(new JournalsCopy, [])

export const updateJournalCopySchema = z.object({
    [updateJournalCopyObject.nameOfJournal]: z.string().optional(),
    [updateJournalCopyObject.nameOfPublisher]: z.string().optional(),
    [updateJournalCopyObject.editorName]: z.string().optional(),
    [updateJournalCopyObject.language]: z.string().optional(),
    [updateJournalCopyObject.department]: z.string().optional(),
    [updateJournalCopyObject.volumeNumber]: z.string().optional(),
    [updateJournalCopyObject.issueNumber]: z.string().optional(),
    [updateJournalCopyObject.isArchived]: z.boolean().optional(),
    [updateJournalCopyObject.isAvailable]: z.boolean().optional(),
    [updateJournalCopyObject.issn]: z.string().optional(),
    [updateJournalCopyObject.callNumber]: z.string().refine(
        (call_number) => {
            return !isNaN(Number(call_number)) && call_number.length === 10
        },
        { message: "Not a valid call number" }
    ).optional(),
    [updateJournalCopyObject.vendorName]: z.string().optional(),
    [updateJournalCopyObject.libraryName]: z.string().optional()
})

export type tUpdateJournalCopyDTO = z.infer<typeof updateJournalCopySchema>
