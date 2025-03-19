import { createObjectOmitProperties } from 'src/misc/create-object-from-class'
import { z } from 'zod'
import { JournalsTable } from '../entity/journals_table.entity'

const createJournalObject = createObjectOmitProperties(new JournalsTable(), ['journalUUID'])


export const createJournalSchema = z.object({
    [createJournalObject.nameOfJournal]: z.string(),
    [createJournalObject.nameOfPublisher]: z.string(),
    [createJournalObject.placeOfPublisher]: z.string(),
    [createJournalObject.editorName]: z.string(),
    [createJournalObject.yearOfPublication]: z.string().date(), //date
    [createJournalObject.language]: z.string(),
    [createJournalObject.department]: z.string(),
    [createJournalObject.subscriptionPrice]: z.number(),
    [createJournalObject.subscriptionStartDate]: z.string().date(), //date
    [createJournalObject.subscriptionEndDate]: z.string().date(), //date
    [createJournalObject.volumeNumber]: z.string(),
    [createJournalObject.issueNumber]: z.string(),
    [createJournalObject.isArchived]: z.boolean(),
    [createJournalObject.totalCount]: z.number(),
    [createJournalObject.availableCount]: z.number(),
    [createJournalObject.frequency]: z.number(),
    [createJournalObject.itemType]: z.string(),
    [createJournalObject.issn]: z.string(),
    [createJournalObject.callNumber]: z.string().refine(
        (call_number) => {
            return !isNaN(Number(call_number)) && call_number.length === 10
        },
        { message: "Not a valid call number" }
    ),
    [createJournalObject.createdAt]: z.string().date(), //date
    [createJournalObject.updatedAt]: z.string().date(), //date
    [createJournalObject.vendorName]: z.string(),
    [createJournalObject.libraryName]: z.string(),
    [createJournalObject.acquisitionDate]: z.string().date(), //date
})

export type tCreateJournalDTO = z.infer<typeof createJournalSchema>