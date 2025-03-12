import { insertQueryHelper } from "src/misc/custom-query-helper";
import { TCreateStudentDTO } from "src/students/zod-validation/createstudents-zod";
import { parentPort, workerData } from "worker_threads";
import { dataSource } from "../datasource-typeorm";
import { Repository } from "typeorm";
import { Students } from "src/students/students.entity";
import { createStudentId } from "src/students/create-student-id";

let uniqueArray: TCreateStudentDTO[] = [];

uniqueArray = (workerData.oneDArray as TCreateStudentDTO[]).filter((value, idx, self) => {
    return self.findIndex(item => item.email === value.email && item.phone_no === value.phone_no) === idx;
});

(async() => {
  const dataSourceInit = await dataSource.initialize();
  const studentRepo: Repository<Students> = dataSourceInit.getRepository(Students);
  for (const item of uniqueArray) {
    try {
      const maxId: [{ max: null | string }] = await studentRepo.manager.query(`SELECT MAX(student_id) FROM students_table`);
      const studentId = createStudentId(maxId[0].max, item.institute_name);
      let queryData = insertQueryHelper({ ...item, student_id: studentId }, ['confirm_password']);
      await studentRepo.manager.query(`INSERT INTO students_table (${queryData.queryCol}) values (${queryData.queryArg})`, queryData.values);
    } catch (error) {
      console.error(error.message);
      (parentPort ? parentPort.postMessage(false) : "Parent Port NULL" );
    }
  }
  (parentPort ? parentPort.postMessage(true) : "Parent Port NULL" );
})();
