import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { StudentQueryValidator } from './student.query-validator';
import { ZodError, ZodSchema } from 'zod';

export type UnionUser = {
  [key in keyof typeof StudentQueryValidator]: Pick<
    typeof StudentQueryValidator,
    key
  >;
}[keyof typeof StudentQueryValidator];

@Injectable()
export class studentValidationPipe implements PipeTransform {
  constructor(private readonly zschema: ZodSchema) {}
  async transform(value: object, metadata: ArgumentMetadata) {
    try {
      if (metadata.type === 'query') {
        //Check is any one field exists
        let notExist: boolean = true;
        for (let key in StudentQueryValidator) {
          if (key in value) {
            notExist = false;
            break;
          }
        }
        if (notExist) {
          throw new Error('email or phone_no or student_id required');
        } 
        await this.zschema.parse(value);
        if('phone_no' in value) {
          value = { phone_no: Number(value.phone_no) };
        }
        return value;
      } else {
        throw new HttpException('Expected a query', HttpStatus.NOT_ACCEPTABLE);
      }
    } catch (error) {
      if (error instanceof ZodError) {
        const modifiedZodError = error.errors.map((errorItem) => {
          return { field: errorItem.path[0], message: errorItem.message };
        });
        throw new HttpException(modifiedZodError[0], HttpStatus.NOT_ACCEPTABLE);
      } else if (error instanceof Error) {
        throw new HttpException(error.message, HttpStatus.NOT_ACCEPTABLE);
      }
    }
  }
}
