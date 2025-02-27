import { z } from 'zod';

export const editBookSchema = z.object({
  book_title: z.string().optional(),
  book_author: z.string().optional(),
  name_of_publisher: z.string().optional(),
  place_of_publication: z.string().optional(),
  year_of_publication: z.string().date().optional(),
  language: z.string().optional(),
  edition: z.string().optional(),
  isbn: z.string().optional(),
  no_of_pages: z.number().optional(),
  no_of_preliminary_pages: z.number().optional(),
  subject: z.string().optional(),
  department: z.string().optional(),
  call_number: z
    .string()
    .refine(
      (call_number) => {
        return !isNaN(Number(call_number)) && call_number.length === 10;
      },
      { message: 'Not a valid phone number' },
    )
    .optional(),
  author_mark: z.string().optional(),
  source_of_acquisition: z.string().optional(),
  date_of_acquisition: z.string().date().optional(),
  bill_no: z.number().optional(),
  inventory_number: z.number().optional(),
  accession_number: z.number().optional(),
  barcode: z.string().optional(),
  item_type: z.string().optional(),
  //   institute_id: z.string().uuid(),
});

export type TEditBookDTO = z.infer<typeof editBookSchema>;
