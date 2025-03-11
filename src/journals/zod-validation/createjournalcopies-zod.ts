import { createObjectOmitProperties } from 'src/create-object-from-class'
import { z } from 'zod'
import { JournalsTable } from '../entity/journals_table.entity'
import { create } from 'domain'

const createJournalCopyObject = createObjectOmitProperties(new JournalsTable(), [])

export const createJournalCopySchema = z.object({
    [createJournalCopyObject.journalUUID]: z.string(),
    [createJournalCopyObject.nameOfJournal]: z.string(),
    [createJournalCopyObject.nameOfPublisher]: z.string(),
    [createJournalCopyObject.editorName]: z.string(),
    [createJournalCopyObject.language]: z.string(),
    [createJournalCopyObject.department]: z.string(),
    [createJournalCopyObject.volumeNumber]: z.string(),
    [createJournalCopyObject.issueNumber]: z.string(),
    [createJournalCopyObject.isArchived]: z.boolean(),
    [createJournalCopyObject.issn]: z.string(),
    [createJournalCopyObject.callNumber]: z.string().refine(
        (call_number) => {
            return !isNaN(Number(call_number)) && call_number.length === 10
        },
        { message: "Not a valid call number" }
    ),
    [createJournalCopyObject.createdAt]: z.coerce.date(), //date
    [createJournalCopyObject.updatedAt]: z.coerce.date(), //date
    [createJournalCopyObject.vendorName]: z.string(),
    [createJournalCopyObject.libraryName]: z.string(),
    [createJournalCopyObject.acquisitionDate]: z.coerce.date(), //date
})

export type tCreateJournalCopyDTO = z.infer<typeof createJournalCopySchema>