import { insertQueryHelper } from "src/custom-query-helper";
import { TCreateStudentDTO } from "src/students/zod-validation/createstudents-zod";
import { parentPort, workerData } from "worker_threads";

let uniqueArray: TCreateStudentDTO[] = [];

uniqueArray = (workerData.oneDArray as TCreateStudentDTO[]).filter((value, idx, self) => {
    return self.findIndex(item => item.email === value.email) === idx;
});

console.log(workerData.repository);
uniqueArray.forEach((item)=>{
    let queryData = insertQueryHelper(item, ['confirm_password']);
    //workerData.repository.query(`INSERT INTO students_table`)
});

(parentPort ? parentPort.postMessage(uniqueArray) : "Parent Port NULL" );