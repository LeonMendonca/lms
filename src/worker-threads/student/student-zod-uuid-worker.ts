import { parentPort, workerData } from "worker_threads";
import { studentUUIDZod, TstudentUUIDZod } from "../../students/zod-validation/studentuuid-zod";

const newArr: TstudentUUIDZod[] = [];
const newErrArr: any[] = [];

workerData.oneDArray.filter((item: any) => {
    let result = studentUUIDZod.safeParse(item);
    if(result.success) {
        newArr.push(result.data);
    }
    if(result.error) {
        let modifiedZodError = result.error.issues[0];
        newErrArr.push({ field: modifiedZodError.path[0], message: modifiedZodError.message });
    }
})

parentPort?.postMessage(newArr);