import { createStudentSchema, TCreateStudentDTO } from 'src/students/dto/student-create.dto';
import { parentPort, workerData } from 'worker_threads';


const newArr: TCreateStudentDTO[] = [];
// const newErrArr: any[] = [];

let countOfInvalidDataFormat = 0;

workerData.oneDArray.forEach((item: any) => {
  let result = createStudentSchema.safeParse(item);
  console.log(result)
  if (result.success) {
    newArr.push(result.data);
  }
  if (result.error) {
    countOfInvalidDataFormat++;
    //let modifiedZodError = result.error.issues[0];
    //newErrArr.push({ field: modifiedZodError.path[0], messsage: modifiedZodError.message });
  }
});

parentPort?.postMessage({
  validated_array: newArr,
  invalid_data_count: countOfInvalidDataFormat,
});
