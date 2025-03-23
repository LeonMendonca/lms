import { insertQueryHelper } from "src/misc/custom-query-helper";
import { TCreateStudentDTO } from "src/students/zod-validation/createstudents-zod";
import { parentPort, workerData } from "worker_threads";
import { Repository } from "typeorm";
import { Students } from "src/students/students.entity";
import { createStudentId } from "src/students/create-student-id";
import { dataSource } from "../datasource-typeorm";
import { pool } from "../pg.connect";

let start = Date.now();
let uniqueArray: TCreateStudentDTO[] = [];

uniqueArray = (workerData.oneDArray as TCreateStudentDTO[]).filter((value, idx, self) => {
    return self.findIndex(item => item.email === value.email && item.phone_no === value.phone_no) === idx;
});
//console.log("Unique array done in", Date.now() - start, 'ms');

(async() => {
  start = Date.now();
  //const d = await studentRepo.query(``);
  //console.log(d);
  //Select maximum ID in Table 
  start = Date.now();
  let maxStudentId: { rows: { max: string | null }[] } = await pool.query(`SELECT MAX(student_id) FROM students_table`);
  let studentId = maxStudentId.rows[0].max;
  //console.log("Max stu id", studentId);
  //console.log('Got Id in', Date.now() - start);

  const bulkQuery = 'INSERT INTO students_table '
  let bulkQuery2 = '';
  let bulkQuery3 = '';

  const insertObjectCol = { ...uniqueArray[0], student_id: '' }
  let key: keyof typeof insertObjectCol | '' = '';

  //Create columns with object received with explicit student_id column
  bulkQuery2 += '(';
  for(key in insertObjectCol) {
    if(key === 'confirm_password') {
      continue;
    }
    bulkQuery2 = bulkQuery2.concat(`${key},`);
  }
  bulkQuery2 = bulkQuery2.slice(0, -1);
  bulkQuery2 += ')';
  bulkQuery2 += ' VALUES '

  for(const stuObj of uniqueArray) {
    bulkQuery3 += '('
    for(key in { ...stuObj, student_id: '' }) {
      if(key === 'confirm_password') {
        continue;
      }
      if(key === 'student_id') {
        studentId = createStudentId(studentId, stuObj.institute_name)
        stuObj[key] = studentId;
      }
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

  const finalQuery = bulkQuery + bulkQuery2 + bulkQuery3;
  //console.log("FINAL QUERY", finalQuery)

  try {
    start = Date.now();
    await pool.query(finalQuery);
    //console.log("Inserted in ", Date.now() - start);
  } catch (error) {
    console.error(error.message);
    //console.log("this insert worker ended at", Date.now() - start, 'ms', false);
    parentPort?.postMessage(false) ?? 'Parent port is null'
  }
  //console.log("this insert worker ended at", Date.now() - start, 'ms', true);
  parentPort?.postMessage(true) ?? 'Parent port is null'
})();
