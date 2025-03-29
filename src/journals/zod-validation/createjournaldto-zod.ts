import z from 'zod';
import { createObjectOmitProperties } from "src/misc/create-object-from-class";
import { JournalTitle } from '../entity/journals_title.entity';
import { JournalCopy } from '../entity/journals_copy.entity';

const createJournalTitleObject = createObjectOmitProperties(
    new JournalTitle(),
    ['updatedAt', 'createdAt', 'journalUUID', 'journalTitleId', 'journalCopies', 'totalCount', 'availableCount', 'isArchived']
);

const createJournalCopyObject = createObjectOmitProperties(
    new JournalCopy(),
    ['journalCopyUUID', 'journalCopyId', 'isAvailable']
);

// Schema for Title and Copies
export const createJournalSchema = z.object({
    // Journal Title fields

    // [createJournalTitleObject.journalTitle]: z.string(),
    // [createJournalTitleObject.editorName]: z.string(),
    [createJournalTitleObject.category]: z.string(),
    [createJournalTitleObject.nameOfPublisher]: z.string(),
    [createJournalTitleObject.placeOfPublication]: z.string(),
    [createJournalTitleObject.subscriptionId]: z.string(),
    [createJournalTitleObject.subscriptionStartDate]: z.string().date(),
    [createJournalTitleObject.subscriptionEndDate]: z.string().date(),
    // [createJournalTitleObject.issn]: z.string(), // add validation for issn
    [createJournalTitleObject.volumeNumber]: z.string(), // add validation for issn
    [createJournalTitleObject.frequency]: z.string(),
    [createJournalTitleObject.issueNumber]: z.string(),
    [createJournalTitleObject.vendorName]: z.string(),
    [createJournalTitleObject.subscriptionPrice]: z.number(),
    [createJournalTitleObject.libraryName]: z.string(),
    [createJournalTitleObject.classificationNumber]: z.string(),
    // [createJournalTitleObject.isArchived]: z.boolean(), --default=false
    // [createJournalTitleObject.totalCount]: z.number(),
    // [createJournalTitleObject.availableCount]: z.number(),
    [createJournalTitleObject.titleImages]: z.array(z.string()).optional(),
    [createJournalTitleObject.titleAdditionalFields]: z.record(z.any()).optional(),
    [createJournalTitleObject.titleDescription]: z.string().optional(),

    // Journal Copy fields,

    [createJournalCopyObject.journalTitle]: z.string(),
    [createJournalCopyObject.editorName]: z.string(),
    [createJournalCopyObject.barcode]: z.string(),
    [createJournalCopyObject.itemType]: z.string(),
    [createJournalCopyObject.instituteUUID]: z.string().uuid().optional(),
    // [createJournalCopyObject.isArchived]: z.boolean(),
    // [createJournalCopyObject.isAvailable]: z.boolean(), -- default=true
    [createJournalCopyObject.issn]: z.string(),
    // [createJournalCopyObject.frequency]: z.string(),
    [createJournalCopyObject.createdBy]: z.string().uuid().optional(),
    [createJournalCopyObject.remarks]: z.string().optional(),
    [createJournalCopyObject.copyImages]: z.array(z.string()).optional(),
    [createJournalCopyObject.copyAdditionalFields]: z.record(z.any()).optional(),
    [createJournalCopyObject.copyDescription]: z.string().optional(),
});

export type TCreateJournalZodDTO = z.infer<typeof createJournalSchema>;
