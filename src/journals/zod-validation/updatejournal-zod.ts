import { z } from "zod"
import { createObjectOmitProperties } from "src/misc/create-object-from-class";
import { JournalsTable } from "../entity/journals_table.entity";

export const udpateJournalObject = createObjectOmitProperties(new JournalsTable, [])

export const updateJournalSchema = z.object({
    [udpateJournalObject.nameOfJournal]: z.string().optional(),
    [udpateJournalObject.nameOfPublisher]: z.string().optional(),
    [udpateJournalObject.placeOfPublisher]: z.string().optional(),
    [udpateJournalObject.editorName]: z.string().optional(),
    [udpateJournalObject.language]: z.string().optional(),
    [udpateJournalObject.department]: z.string().optional(),
    // [udpateJournalObject.subscriptionPrice]: z.string().transform((val) => (typeof val === 'string' ? parseInt(val) : undefined)).optional(),
    [udpateJournalObject.subscriptionPrice]: z.number().optional(),
    [udpateJournalObject.volumeNumber]: z.string().optional(),
    [udpateJournalObject.issueNumber]: z.string().optional(),
    [udpateJournalObject.isArchived]: z.boolean().optional(),
    // [udpateJournalObject.totalCount]: z.string().transform((val) => (typeof val === 'string' ? parseInt(val) : undefined)).optional(),
    [udpateJournalObject.totalCount]: z.number().optional(),
    // [udpateJournalObject.availableCount]: z.string().transform((val) => (typeof val === 'string' ? parseInt(val) : undefined)).optional(),
    [udpateJournalObject.availableCount]: z.number().optional(),
    [udpateJournalObject.itemType]: z.string().optional(),
    [udpateJournalObject.issn]: z.string().optional(),
    [udpateJournalObject.callNumber]: z.string().refine(
        (call_number) => {
            return !isNaN(Number(call_number)) && call_number.length === 10
        },
        { message: "Not a valid call number" }
    ).optional(),
    [udpateJournalObject.vendorName]: z.string().optional(),
    [udpateJournalObject.libraryName]: z.string().optional(),
    [udpateJournalObject.acquisitionDate]: z.string().optional()
})

export type tUpdateJournalDTO = z.infer<typeof updateJournalSchema>
