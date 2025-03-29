import { parentPort, workerData } from "worker_threads";
import { bookUUIDZod, TbookUUIDZod } from "../../books_v2/zod/bookuuid-zod";

const newArr: TbookUUIDZod[] = [];
const newErrArr: any[] = [];

let countOfInvalidDataFormat = 0;

workerData.oneDArray.filter((item: any) => {
    let result = bookUUIDZod.safeParse(item);
    if(result.success) {
        newArr.push(result.data);
    }
    if(result.error) {
        countOfInvalidDataFormat++
        //let modifiedZodError = result.error.issues[0];
        //newErrArr.push({ field: modifiedZodError.path[0], message: modifiedZodError.message });
    }
})

parentPort?.postMessage({ validated_array: newArr, invalid_data_count: countOfInvalidDataFormat });