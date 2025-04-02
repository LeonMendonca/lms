import { TCreateStudentDTO } from "src/students/zod-validation/createstudents-zod";
import { parentPort, workerData } from "worker_threads";
import { pool } from "../../pg.connect";
import { TInsertResult } from "../worker-types/student-insert.type";

let start = Date.now();
let uniqueArray: TCreateStudentDTO[] = []; 

//Count duplicates in existing array of payload
let countDuplicatePayload = 0;
uniqueArray = (workerData.oneDArray as TCreateStudentDTO[]).filter((value, idx, self) => {
    return self.findIndex(item => item.email === value.email) === idx ? value : countDuplicatePayload++;
});
console.log("Unique array done in", Date.now() - start, 'ms');

(async() => {
  let client = await pool.connect();

  client.on('error', (err) => {
    console.error("Pool Client in INSERT worker emitted error", err.message);
  });

  start = Date.now();
  //Select maximum ID in Table 
  start = Date.now();

  const bulkQuery1 = 'INSERT INTO students_table '
  let bulkQuery2 = '';
  let bulkQuery3 = '';

  const insertObjectCol = uniqueArray[0]
  let key: keyof typeof insertObjectCol | '' = '';

  //Create columns with object received with explicit student_id column
  bulkQuery2 += '(';
  for(key in insertObjectCol) {
    bulkQuery2 = bulkQuery2.concat(`${key},`);
  }
  bulkQuery2 = bulkQuery2.slice(0, -1);
  bulkQuery2 += ')';
  bulkQuery2 += ' VALUES '

  //Count payload being inserted after filter
  let countInsertPayload = uniqueArray.length;

  for(const stuObj of uniqueArray) {
    bulkQuery3 += '('
    for(key in stuObj) {
      if(typeof stuObj[key] === 'string') {
        bulkQuery3 += `'${stuObj[key]}',`
      } else {
        bulkQuery3 += `${stuObj[key]},`
      }
    }
    bulkQuery3 = bulkQuery3.slice(0, -1);
    bulkQuery3 += '),'
  }
  bulkQuery3 = bulkQuery3.slice(0, -1);

  const finalQuery = bulkQuery1 + bulkQuery2 + bulkQuery3 + 'ON CONFLICT (email) DO NOTHING RETURNING email'; 

  try {
    start = Date.now();
    const result = await client.query(finalQuery);

    const insertedData = result.rowCount ?? 0;
    const duplicateDataDb = countInsertPayload - insertedData;

    parentPort?.postMessage(
      {
        duplicate_data_pl: countDuplicatePayload, 
        duplicate_date_db: duplicateDataDb,
        inserted_data: insertedData,
        unique_data: countInsertPayload
      } as TInsertResult
    ) ?? 'Parent port is null'
    //console.log("Inserted in ", Date.now() - start);
  } catch (error) {
      let errorMessage = "Something went wrong while bulk inserting";
      if(error instanceof Error) {
        errorMessage = error.message;
      }
    //console.log("this insert worker ended at", Date.now() - start, 'ms', false);
      parentPort?.postMessage(errorMessage) ?? 'Parent port is null'
  }
  client.release(true);
  //console.log("this insert worker ended at", Date.now() - start, 'ms', true);
})();
