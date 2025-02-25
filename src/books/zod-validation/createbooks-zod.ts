import { z } from 'zod';

export const createBookSchema = z.object({
  book_title: z.string(),
  book_author: z.string(),
  name_of_publisher: z.string(),
  place_of_publication: z.string(),
  year_of_publication: z.string().date(),
  language: z.string(),
  edition: z.string(),
  isbn: z.string(),
  no_of_pages: z.number(),
  no_of_preliminary_pages: z.number(),
  subject: z.string(),
  department: z.string(),
  call_number: z.string().refine(
    (call_number) => {
      return !isNaN(Number(call_number)) && call_number.length === 10;
    },
    { message: 'Not a valid phone number' },
  ),
  author_mark: z.string(),
  source_of_acquisition: z.string(),
  date_of_acquisition: z.string().date(),
  bill_no: z.number(),
  inventory_number: z.number(),
  accession_number: z.number(),
  barcode: z.string(),
  item_type: z.string(),
  institute_id: z.string().uuid(),
});

export type TCreateBookDTO = z.infer<typeof createBookSchema>;
