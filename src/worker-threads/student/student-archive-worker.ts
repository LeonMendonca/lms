import { parentPort, workerData } from "worker_threads";
import { dataSource } from "../datasource-typeorm";
import { Repository } from "typeorm";
import { Students } from "src/students/students.entity";
import { TstudentUUIDZod } from "src/students/zod-validation/studentuuid-zod";


(async() => {
    let arrOfUUID = workerData.oneDArray as TstudentUUIDZod[];
    let arrOfArchivedStatus: string[] = [];

    const dataSourceInit = await dataSource.initialize();
    const studentRepo: Repository<Students> = dataSourceInit.getRepository(Students);
    try {
        for (const uuid of arrOfUUID) {
            let result: [[], number] = await studentRepo.manager.query(`
                UPDATE students_table SET is_archived = true WHERE student_uuid = '${uuid}' AND is_archived = false`
            );
            if(!result[1]) {
                arrOfArchivedStatus.push(`Unable to archive ${uuid}`);
            } else {
                arrOfArchivedStatus.push(`Succesfully archived ${uuid}`);
            }
        }
        (parentPort ? parentPort.postMessage(arrOfArchivedStatus) : "Parent Port NULL" );
    }
    catch (error) {
        (parentPort ? parentPort.postMessage(error.message) : "Parent Port NULL" );
    }

})()