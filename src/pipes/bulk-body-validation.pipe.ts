import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Chunkify } from 'src/worker-threads/chunk-array';
import { CreateWorker } from 'src/worker-threads/worker-main-thread';

@Injectable()
export class bulkBodyValidationPipe<T extends object | string> implements PipeTransform {
  constructor(private readonly workerThreadPath: string) {}
  async transform(value: any, metadata: ArgumentMetadata) {
    //initializing array with empty value;
    let BatchArr: Promise<T[]>[] = [];
    let BatchOfStudentValues: any[][] = [];
    if(metadata.type === 'body') {
      if(value && Array.isArray(value) && value.length != 0) {
        BatchOfStudentValues = Chunkify(value);
        for(let i = 0; i < BatchOfStudentValues.length ; i++) {
            BatchArr.push((CreateWorker<T>(BatchOfStudentValues[i], this.workerThreadPath)));
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

