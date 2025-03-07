import { parentPort, workerData } from "worker_threads";
import { createStudentSchema, TCreateStudentDTO } from "src/students/zod-validation/createstudents-zod";

const newArr: TCreateStudentDTO[] = [];
const newErrArr: any[] = [];

workerData.oneDArray.filter((item: any)=> {
    let result = createStudentSchema.safeParse(item);
    if(result.success) {
        newArr.push(result.data)
    }
    if(result.error) {
    let modifiedZodError = result.error.issues[0];
        newErrArr.push({ field: modifiedZodError.path[0], messsage: modifiedZodError.message });
    }
})


(parentPort ? parentPort.postMessage(newArr) : "Parent Port NULL" );