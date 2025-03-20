// import { findJournalCopyQuery } from "../zod-validation/journalcopyquery-zod";

// export const journalCopyQueryValidator = {
//     [findJournalCopyQuery.nameOfJournal]: '',
//     [findJournalCopyQuery.nameOfPublisher]: '',
//     [findJournalCopyQuery.editorName]: '',
//     [findJournalCopyQuery.language]: '',
//     [findJournalCopyQuery.department]: '',
//     [findJournalCopyQuery.volumeNumber]: '',
//     [findJournalCopyQuery.issueNumber]: '',
//     [findJournalCopyQuery.isArchived]: '',
//     [findJournalCopyQuery.issn]: '',
//     [findJournalCopyQuery.callNumber]: '',
//     [findJournalCopyQuery.journal_uuid]: '',
//     [findJournalCopyQuery.journalID]: '',
//     [findJournalCopyQuery.vendorName]: '',
//     [findJournalCopyQuery.libraryName]: '',

// }

// export type JournalCopyValidate = {
//     [key in keyof typeof journalCopyQueryValidator]: Pick<
//         typeof journalCopyQueryValidator,
//         key
//     >
// }[keyof typeof journalCopyQueryValidator]