import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { TCreateStudentDTO } from 'src/students/zod-validation/createstudents-zod';
import { Chunkify } from 'src/worker-threads/chunk-array';
import { CreateWorker } from 'src/worker-threads/worker-main-thread';
import { ZodSchema, ZodError } from 'zod';

@Injectable()
export class bulkBodyValidationPipe implements PipeTransform {
  constructor(private readonly zschema: ZodSchema) {}
  async transform(value: any, metadata: ArgumentMetadata) {
    //initializing array with empty value;
    let BatchArr: TCreateStudentDTO[][] = [];
    let BatchOfStudentValues: any[][] = [];
    if(metadata.type === 'body') {
      if(value && Array.isArray(value)  && value.length != 0) {
        BatchOfStudentValues = Chunkify(value);
        console.log("chunked array done..", BatchOfStudentValues.length);
        for(let i = 0; i < BatchOfStudentValues.length ; i++) {
          console.log("now creating batches")
          let result = await (CreateWorker(BatchOfStudentValues[i], 'student/student-zod-body-worker') as Promise<TCreateStudentDTO[]>)
          if(result.length != 0) {
            BatchArr.push(result);
          }
          console.log("all batch done!")
        }
        let zodValidatedArray = (await Promise.all(BatchArr)).flat();
        if(zodValidatedArray.length === 0) {
          throw new HttpException("No valid data found", HttpStatus.BAD_REQUEST);
        }
        return zodValidatedArray;
      } else {
        throw new HttpException("Required an Array or Empty array not accepted", HttpStatus.BAD_REQUEST);
      }
    } else {
      throw new HttpException("Required a body", HttpStatus.BAD_REQUEST);
    }
  }
}

