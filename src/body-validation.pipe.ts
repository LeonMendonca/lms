import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { z, ZodSchema, ZodError, ZodType, ZodTypeAny } from 'zod';

@Injectable()
export class booksValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    try {
      if (metadata.type === 'body') {
        //validation logic with zod
        const parsedValue = this.schema.parse(value);
        return parsedValue;
      } else {
        throw new Error('Body required');
      }
    } catch (error) {
      if (error instanceof ZodError) {
        const modifiedZodError = error.errors.map((errorItem) => {
          return { field: errorItem.path[0], message: errorItem.message };
        });
        throw new HttpException(modifiedZodError, HttpStatus.NOT_ACCEPTABLE);
      } else {
        throw new HttpException(
          'Undefined Error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
