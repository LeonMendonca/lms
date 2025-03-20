import z from 'zod';
import { createObjectOmitProperties } from "src/misc/create-object-from-class";
import { JournalTitle } from '../entity/journals_title.entity';
import { JournalCopy } from '../entity/journals_copy.entity';

const createJournalTitleObject = createObjectOmitProperties(
    new JournalTitle(),
    ['availableCount', 'totalCount', 'updatedAt', 'createdAt', 'journalUUID', 'journalTitleId', 'journalCopies', 'isArchived']
);

const createJournalCopyObject = createObjectOmitProperties(
    new JournalCopy(),
    ['journalCopyUUID', 'isArchived', 'isAvailable', 'journalCopyId', 'updatedAt', 'createdAt']
);

// Schema for Title and Copies
export const createJournalSchema = z.object({
    // Journal Title fields

    [createJournalTitleObject.journalTitle]: z.string(),
    [createJournalTitleObject.journalAuthor]: z.string(),
    [createJournalTitleObject.nameOfPublisher]: z.string(),
    [createJournalTitleObject.placeOfPublication]: z.string(),
    [createJournalTitleObject.yearOfPublication]: z.string().date(),
    [createJournalTitleObject.edition]: z.string(),
    [createJournalTitleObject.issn]: z.string(), // add validation for issn
    [createJournalTitleObject.noPages]: z.string(),
    [createJournalTitleObject.noPreliminary]: z.string(),
    [createJournalTitleObject.subject]: z.string(),
    [createJournalTitleObject.department]: z.string(),
    [createJournalTitleObject.callNumber]: z.string(),
    [createJournalTitleObject.authorMark]: z.string(),
    [createJournalTitleObject.titleImages]: z.array(z.string()).optional(),
    [createJournalTitleObject.titleAdditionalFields]: z.record(z.any()).optional(),
    [createJournalTitleObject.titleDescription]: z.string().optional(),

    // Journal Copy fields

    [createJournalCopyObject.sourceOfAcquisition]: z.string(),
    [createJournalCopyObject.dateOfAcquisition]: z.string().date(),
    [createJournalCopyObject.billNo]: z.string(),
    [createJournalCopyObject.language]: z.string(),
    [createJournalCopyObject.inventoryNumber]: z.string().optional(),
    [createJournalCopyObject.accessionNumber]: z.string(),
    [createJournalCopyObject.barcode]: z.string(),
    [createJournalCopyObject.itemType]: z.string(),
    [createJournalCopyObject.instituteUUID]: z.string().uuid().optional(),
    [createJournalCopyObject.createdBy]: z.string().uuid().optional(),
    [createJournalCopyObject.remarks]: z.string().optional(),
    [createJournalCopyObject.copyImages]: z.array(z.string()).optional(),
    [createJournalCopyObject.copyAdditionalFields]: z.record(z.any()).optional(),
    [createJournalCopyObject.copyDescription]: z.string().optional(),
});

export type TCreateJournalZodDTO = z.infer<typeof createJournalSchema>;
