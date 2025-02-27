import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  HttpException,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { TEditStudentDTO } from 'src/students/zod-validation/putstudent-zod';
import { ZodSchema, ZodError } from 'zod';

@Injectable()
export class putBodyValidationPipe implements PipeTransform {
  constructor(private zschema: ZodSchema) {}
  transform(value: unknown, metadata: ArgumentMetadata) {
    try {
      if (metadata.type === 'body') {
        return this.zschema.parse(value) as TEditStudentDTO;
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
