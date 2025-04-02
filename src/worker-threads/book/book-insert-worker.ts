import { TCreateBookZodDTO } from "src/books_v2/zod/createbookdtozod";
import { parentPort, workerData } from "worker_threads";
import { pool } from "../../pg.connect";
import { TInsertResult } from "../worker-types/student-insert.type";

const bookPayloadArr = workerData.oneDArray as TCreateBookZodDTO[];


(async() => {
    let client = await pool.connect();    

    client.on('error', (err) => {
        console.error("Pool Client in INSERT worker emitted error", err.message);
    });

    let bulkQuery1Title = '';

    for(let element of bookPayloadArr) {
        bulkQuery1Title += `'${element.isbn}',`
    }

    bulkQuery1Title = bulkQuery1Title.slice(0, -1)

    console.log("ISBN", bulkQuery1Title)
    //await client.query(`SELECT book_uuid FROM book_titles WHERE isbn IN ()`)

    parentPort?.postMessage('test') ?? "Parent Port NULL";
    client.release(true);
})()