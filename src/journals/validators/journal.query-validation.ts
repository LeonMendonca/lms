import { findJournalQuery } from "../zod-validation/journalquery-zod";

export const journalQueryValidator = {
    [findJournalQuery.journalUUID]: '',
    [findJournalQuery.nameOfJournal]: '',
    [findJournalQuery.nameOfPublisher]: '',
    [findJournalQuery.placeOfPublisher]: '',
    [findJournalQuery.editorName]: '',
    [findJournalQuery.language]: '',
    [findJournalQuery.department]: '',
    [findJournalQuery.isArchived]: '',
    [findJournalQuery.totalCount]: '',
    [findJournalQuery.availableCount]: '',
    [findJournalQuery.itemType]: '',
    [findJournalQuery.issn]: '',
    [findJournalQuery.callNumber]: '',
    [findJournalQuery.vendorName]: '',
    [findJournalQuery.libraryName]: '',
    [findJournalQuery.subscriptionPrice]: '',
    [findJournalQuery.volumeNumber]: '',
    [findJournalQuery.issueNumber]: ''
}


export type JournalValidate = {
    [key in keyof typeof journalQueryValidator]: Pick<
        typeof journalQueryValidator,
        key
    >
}[keyof typeof journalQueryValidator]