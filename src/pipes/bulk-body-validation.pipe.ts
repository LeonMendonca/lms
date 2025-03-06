import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';

@Injectable()
export class bulkBodyValidationPipe implements PipeTransform {
  constructor(private readonly zschema: ZodSchema) {}
  transform(value: any, metadata: ArgumentMetadata) {
    if(metadata.type === 'body') {
      if(value && Array.isArray(value))
        return value.map((item)=> {
          if(this.zschema.safeParse(item).success) {
            return item;
          }
        })
    } else {
      throw new HttpException("Required a body", HttpStatus.BAD_REQUEST);
    }
  }
}

