import { z } from "zod"
import { createObjectIncludeProperties } from "src/create-object-from-class";
import { JournalsCopy } from "../entity/journals_copy.entity";

export const findJournalCopyQuery = createObjectIncludeProperties(new JournalsCopy(), ['nameOfJournal', 'nameOfPublisher', 'editorName', 'language', 'department', 'volumeNumber', 'issueNumber', 'isArchived', 'issn', 'callNumber', 'journal_uuid', 'journalID', 'vendorName', 'libraryName'])

export const findJournalCopyQuerySchema = z.object({
    [findJournalCopyQuery.journal_uuid]: z.string().uuid().optional(),
    [findJournalCopyQuery.journalID]: z.string().optional().transform((val) => (typeof val === 'string' ? parseInt(val) : undefined)),
    [findJournalCopyQuery.nameOfJournal]: z.string().min(1, { message: "Name of the Journal Not Provided" }).optional(),
    [findJournalCopyQuery.nameOfPublisher]: z.string().min(1, { message: "Name of the Publisher Not Provided" }).optional(),
    [findJournalCopyQuery.editorName]: z.string().min(1, { message: "Name of the Editor Not Provided" }).optional(),
    [findJournalCopyQuery.language]: z.string().optional(),
    [findJournalCopyQuery.department]: z.string().optional(), // add enum to this
    // [findJournalQuery.volumeNumber]: z.number().min(1, { message: "Volume Number is Not Provided" }).optional(),
    [findJournalCopyQuery.volumeNumber]: z.string().min(1, { message: "Volume Number is Not Provided" }).optional().transform((val) => (typeof val === 'string' ? parseInt(val) : undefined)),
    // [findJournalQuery.issueNumber]: z.coerce.number().min(1, { message: "Issue Number is Not Provided" }).optional(),
    [findJournalCopyQuery.issueNumber]: z.string().min(1, { message: "Issue Number is Not Provided" }).optional().transform((val) => (typeof val === 'string' ? parseInt(val, 10) : undefined)),
    // [findJournalQuery.isArchived]: z.boolean().optional(),
    [findJournalCopyQuery.isArchived]: z.string().optional().transform((val) => val === 'true'),
    [findJournalCopyQuery.issn]: z.string().min(1, { message: "ISSN is Not Provided" }).optional(),
    [findJournalCopyQuery.callNumber]: z.string().min(1, { message: "Call Number is Not Provided" }).optional(),
    [findJournalCopyQuery.vendorName]: z.string().min(1, { message: "Vendor Name is Not Provided" }).optional(),
    [findJournalCopyQuery.libraryName]: z.string().min(1, { message: "Library Name is Not provided" }).optional()
})

export type tFindJournalCopyQueryDTO = z.infer<typeof findJournalCopyQuerySchema>