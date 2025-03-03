import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  HttpException,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { isEmptyObject } from 'src/check-empty-object';
import { ZodSchema, ZodError } from 'zod';

@Injectable()
export class putBodyValidationPipe implements PipeTransform {
  constructor(private zschema: ZodSchema) {}
  transform(value: object, metadata: ArgumentMetadata) {
    try {
      if (metadata.type === 'body') {
        const parsedObject = this.zschema.parse(value);
        if (isEmptyObject(parsedObject)) {
          throw new Error('No body provided or Invalid body');
        }
        return parsedObject;
      } else if (metadata.type === 'param') {
        return value;
      } else {
        throw new Error('Body & Param required');
      }
    } catch (error) {
      if (error instanceof ZodError) {
        const modifiedZodError = error.errors.map((errorItem) => {
          return { field: errorItem.path[0], message: errorItem.message };
        });
        throw new HttpException(modifiedZodError, HttpStatus.NOT_ACCEPTABLE);
      } else {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
