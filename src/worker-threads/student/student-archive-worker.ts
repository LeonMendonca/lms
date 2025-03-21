import { parentPort, workerData } from "worker_threads";
import { TstudentUUIDZod } from "src/students/zod-validation/studentuuid-zod";
import { pool } from "../pg.connect";


(async() => {
    let arrOfUUID = workerData.oneDArray as TstudentUUIDZod[];

    let bulkQuery1 = 'UPDATE students_table SET is_archived = TRUE WHERE student_uuid IN ';

    let bulkQuery2 = '(';
    for(const element of arrOfUUID) {
        bulkQuery2 += `'${element}',`
    }
    bulkQuery2 = bulkQuery2.slice(0, -1);
    bulkQuery2 += ')';

    const finalQuery = bulkQuery1 + bulkQuery2;

    console.log("FINAL QUERY", finalQuery)
    try {
        await pool.query(finalQuery);
        parentPort?.postMessage("Archived Successful")
    }
    catch (error) {
        parentPort?.postMessage("Something went wrong while bulk archiving")
    }
})()