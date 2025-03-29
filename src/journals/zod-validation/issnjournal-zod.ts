import { z } from 'zod';
import { parse } from 'isbn3';

export const issnJournalSchema = z.object({
    issn: z.string().refine((issn) => {
        let issnObject = parse(issn)
        if (issnObject) {
            return issnObject.isValid;
        }
    }, { message: "Invalid ISSN" }),
});

export type TissnJournalZodDTO = z.infer<typeof issnJournalSchema>;
