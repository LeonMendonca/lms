import { parentPort, workerData } from "worker_threads";
import { createStudentSchema, TCreateStudentDTO } from "src/students/zod-validation/createstudents-zod";

const newArr: TCreateStudentDTO[] = [];
const newErrArr: any[] = [];

//console.log("Worker Date is", workerData)

//console.log("First element", workerData.oneDArray[0]);

let countOfInvalidDataFormat = 0;

workerData.oneDArray.forEach((item: any)=> {
    let result = createStudentSchema.safeParse(item);
    if(result.success) {
        newArr.push(result.data)
    }
    if(result.error) {
        countOfInvalidDataFormat++
        //let modifiedZodError = result.error.issues[0];
        //newErrArr.push({ field: modifiedZodError.path[0], messsage: modifiedZodError.message });
    }
})

parentPort?.postMessage({ validated_array: newArr, invalid_data_count: countOfInvalidDataFormat })
