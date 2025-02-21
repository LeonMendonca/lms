import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { createBookDTO } from './dto/createbooks-dto';
import { CreateBookDTO } from './zod-validation/createbooks-zod';
import { ZodSchema, ZodError } from 'zod';

@Injectable()
export class booksValidationPipe
  implements PipeTransform<unknown, createBookDTO | undefined>
{
  constructor(private schema: ZodSchema) {}
  transform(value: unknown, metadata: ArgumentMetadata) {
    try {
      if (metadata.type === 'body') {
        //validation logic with zod
        const parsedValue = this.schema.parse(value) as CreateBookDTO;
        return parsedValue;
      }
    } catch (error) {
      if (error instanceof ZodError) {
        const modifiedZodError = error.errors.map((errorItem) => {
          return { field: errorItem.path[0], message: errorItem.message };
        });
        throw new HttpException(modifiedZodError, HttpStatus.NOT_ACCEPTABLE);
      }
    }
  }
}
