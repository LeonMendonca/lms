import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ZodError, ZodSchema } from 'zod';

@Injectable()
export class QueryValidationPipe implements PipeTransform {
  constructor(
    private readonly zschema: ZodSchema,
    private readonly validatorObject: object,
  ) {}
  async transform(value: object, metadata: ArgumentMetadata) {
    try {
      if (metadata.type === 'query') {
        //Check is any one field exists
        let notExist: boolean = true;
        let requiredKeyText = '';
        for (let key in this.validatorObject) {
          requiredKeyText = requiredKeyText.concat(`${key} or `);
          if (key in value) {
            notExist = false;
            break;
          }
        }
        if (notExist) {
          requiredKeyText = requiredKeyText.slice(0, -3);
          throw new Error(requiredKeyText.concat('required'));
        }
        //validate with Zod
        await this.zschema.parse(value);
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
