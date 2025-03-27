import { TCreateStudentDTO } from "src/students/zod-validation/createstudents-zod";
import { parentPort, workerData } from "worker_threads";
import { createStudentId } from "src/students/create-student-id";
import { pool } from "../../pg.connect";
import { insertQueryHelper } from "src/misc/custom-query-helper";
import { QueryResult } from "typeorm";

let start = Date.now();
let uniqueArray: TCreateStudentDTO[] = [];

uniqueArray = (workerData.oneDArray as TCreateStudentDTO[]).filter((value, idx, self) => {
    return self.findIndex(item => item.email === value.email && item.phone_no === value.phone_no) === idx;
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
    //const insertedData: any[] = [];
    //for(let element of (workerData.oneDArray as TCreateStudentDTO[])) {
    //  const queryData = insertQueryHelper(element, [])
    //  const result = await client.query(`INSERT INTO students_table(${queryData.queryCol}) VALUES (${queryData.queryArg}) ON CONFLICT (email) DO NOTHING RETURNING email`, queryData.values);
    //  const rows = result.rows;
    //  insertedData.push(result.rows[0].email);
    //}
    const result = await client.query(finalQuery);
    if(!result.rows.length) {
      throw new Error("Data already exists, Failed to Insert!");
    }
    parentPort?.postMessage(result.rows) ?? 'Parent port is null'
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
