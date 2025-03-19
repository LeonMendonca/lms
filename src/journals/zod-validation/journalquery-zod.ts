import { createObjectIncludeProperties } from "src/misc/create-object-from-class"
import { z } from "zod"
import { JournalsTable } from "../entity/journals_table.entity"


export const findJournalQuery = createObjectIncludeProperties(new JournalsTable(), ['journalUUID', 'nameOfJournal', 'nameOfPublisher', 'placeOfPublisher', 'editorName', 'language', 'department', 'isArchived', 'totalCount', 'availableCount', 'itemType', 'issn', 'callNumber', 'vendorName', 'libraryName', 'subscriptionPrice', 'volumeNumber', 'issueNumber'])

export const findJournalQuerySchema = z.object({
    [findJournalQuery.journalUUID]: z.string().uuid().optional(),
    [findJournalQuery.nameOfJournal]: z.string().min(1, { message: "Name of the Journal Not Provided" }).optional(),
    [findJournalQuery.nameOfPublisher]: z.string().min(1, { message: "Name of the Publisher Not Provided" }).optional(),
    [findJournalQuery.placeOfPublisher]: z.string().min(1, { message: "Place of Publisher is Not Provided" }).optional(),
    [findJournalQuery.editorName]: z.string().min(1, { message: "Name of the Editor Not Provided" }).optional(),
    [findJournalQuery.language]: z.string().optional(),
    [findJournalQuery.department]: z.string().optional(),
    [findJournalQuery.isArchived]: z.string().optional().transform((val) => (val === 'true')),
    [findJournalQuery.totalCount]: z.string().optional().transform((val) => (typeof val === 'string' ? parseInt(val) : undefined)),
    [findJournalQuery.availableCount]: z.string().optional().transform((val) => (typeof val === 'string' ? parseInt(val) : undefined)),
    [findJournalQuery.itemType]: z.string().min(1, { message: "Item Type is Not Provided" }).optional(),
    [findJournalQuery.issn]: z.string().min(1, { message: "ISSN is Not Provided" }).optional(),
    [findJournalQuery.callNumber]: z.string().min(1, { message: "Call Number is Not Provided" }).optional(),
    [findJournalQuery.vendorName]: z.string().min(1, { message: "Vendor Name is Not Provided" }).optional(),
    [findJournalQuery.libraryName]: z.string().min(1, { message: "Library Name is Not provided" }).optional(),
    [findJournalQuery.subscriptionPrice]: z.string().optional().transform((val) => (typeof val === 'string' ? parseInt(val) : undefined)),
    [findJournalQuery.volumeNumber]: z.string().min(1, { message: "Volume Number is Not Provided" }).optional().transform((val) => (typeof val === 'string' ? parseInt(val) : undefined)),
    [findJournalQuery.issueNumber]: z.string().min(1, { message: "Issue Number is Not Provided" }).optional().transform((val) => (typeof val === 'string' ? parseInt(val, 10) : undefined))
})

export type tFindJournalQueryDTO = z.infer<typeof findJournalQuerySchema>