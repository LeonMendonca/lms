import { createObjectIncludeProperties } from 'src/create-object-from-class'
import {z} from 'zod'
import { Booklog } from '../book_log.entity'

const booklogCreateObject = createObjectIncludeProperties(new Booklog(), ['bookUUID', 'studentuuid']);

const booklogSchema = z.object({
    [booklogCreateObject.studentuuid]: z.string().uuid(),
    [booklogCreateObject.bookUUID]: z.string().uuid()
});

export type TCreateBooklogDTO = z.infer<typeof booklogSchema>