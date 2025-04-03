import { parentPort, workerData } from "worker_threads";
import { createBookSchema, TCreateBookZodDTO } from "src/books_v2/zod/createbookdtozod";

const newArr: TCreateBookZodDTO[] = [];
const newErrArr: any[] = [];

let countOfInvalidDataFormat = 0;

workerData.oneDArray.forEach((item: any)=> {
    let result = createBookSchema.safeParse(item);
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
