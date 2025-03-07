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
    let BatchArr: TCreateStudentDTO[][] = [[]];
    let BatchOfStudentValues: any[][] = [[]];
    if(metadata.type === 'body') {
      if(value && Array.isArray(value))
        BatchOfStudentValues = Chunkify(value);
        for(let i = 0; i < BatchOfStudentValues.length ; i++) {
          //BatchArr.push(await CreateWorker(BatchOfStudentValues[i], 'student-worker'));
          BatchArr.push(await (CreateWorker(BatchOfStudentValues[i], 'student/student-zod-worker') as Promise<TCreateStudentDTO[]>));
        }
        return BatchArr.flat();
    } else {
      throw new HttpException("Required a body", HttpStatus.BAD_REQUEST);
    }
  }
}

