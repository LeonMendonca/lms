import { studentUuidZod, TStudentUuidZod } from 'src/students/dto/student-bulk-delete.dto';
import { parentPort, workerData } from 'worker_threads';


const newArr: TStudentUuidZod[] = [];

let countOfInvalidDataFormat = 0;

workerData.oneDArray.filter((item: any) => {
  let result = studentUuidZod.safeParse(item);
  if (result.success) {
    newArr.push(result.data);
  }
  if (result.error) {
    countOfInvalidDataFormat++;
  }
});

parentPort?.postMessage({
  validated_array: newArr,
  invalid_data_count: countOfInvalidDataFormat,
});
