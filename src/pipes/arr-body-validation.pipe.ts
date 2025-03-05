import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';

@Injectable()
export class arrBodyValidationPipe implements PipeTransform {
    constructor(private zschema: ZodSchema) {}

    transform(value: any[], metadata: ArgumentMetadata) {
        try {
        if(metadata.type === 'body') {
            if(Array.isArray(value)) {
                return value.filter((item) => {
                    let result = this.zschema.safeParse(item);
                    if(result.success) {
                        return item;
                    }
                });
            } else {
                throw new Error(`Not a valid body ${value}`);
            }
        }
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);   
        }
        
    }
}