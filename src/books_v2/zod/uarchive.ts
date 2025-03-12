import { createObjectIncludeProperties, createObjectOmitProperties } from 'src/misc/create-object-from-class';
import z from 'zod'
import { BookTitle } from '../entity/books_v2.title.entity';



const createBookTitleObject = createObjectIncludeProperties(new BookTitle(), ['bookUUID']);

export const createObjectSchema=z.object({
[createBookTitleObject.bookUUID]:z.string()
    
}) 

export type TupdatearchiveZodDTO=z.infer<typeof createObjectSchema>;
