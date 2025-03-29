import { parentPort, workerData } from "worker_threads";
import { TstudentUUIDZod } from "src/students/zod-validation/studentuuid-zod";
import { pool } from "../../pg.connect";
import { TUpdateResult } from "../student/student-archive-worker";


(async () => {
    let client = await pool.connect();

    client.on('error', (err) => {
        console.error("Pool Client in ARCHIVE worker emitted error", err.message);
    });

    let arrOfUUID = workerData.oneDArray as TstudentUUIDZod[];

    const updatedPayloadCount = arrOfUUID.length;

    console.log("UUIDS", arrOfUUID);

    //BULK ARCHIVE book_copies

    let bulkQuery1Copies = 'UPDATE book_copies SET is_archived = TRUE WHERE book_copy_uuid IN ';

    let bulkQuery2Copies = '(';
    for (const element of arrOfUUID) {
        bulkQuery2Copies += `'${element}',`
    }
    bulkQuery2Copies = bulkQuery2Copies.slice(0, -1);
    bulkQuery2Copies += ')';

    let bulkQuery3Copies = 'AND is_archived = FALSE AND is_available = TRUE RETURNING book_title_uuid'

    /*
    update book_copies set is_archived = true where book_copy_uuid in ('uuid', 'uuid', ....) 
    and is_archived = false RETURNING book_title_uuid
    */
    const finalQueryCopies = bulkQuery1Copies + bulkQuery2Copies + bulkQuery3Copies;

    //console.log("FINAL QUERY", finalQuery)
    try {
        const archivedCountObject = new Object() as { [key: string]: number };
        const result = await client.query(finalQueryCopies);

        const updatedDataCount = result.rowCount ?? 0;
        const nonUpdatedDataCount = updatedPayloadCount - updatedDataCount;

        //If atleast one is archived in copies table, query titles table
        if (updatedDataCount) {
            for (let element of result.rows) {
                if (element.book_title_uuid in archivedCountObject) {
                    archivedCountObject[element.book_title_uuid]++;
                    continue;
                }
                archivedCountObject[element.book_title_uuid] = 1
            }
            //console.log("Archived Count", archivedCountObject);
            //console.log(result.rows);

            //BULK ARCHIVE book_title 
            let bulkQuery1Title = 'UPDATE book_titles SET available_count = CASE';

            let bulkQuery2Title = '';
            let bulkQuery3Title = '(';

            for (let key in archivedCountObject) {
                bulkQuery2Title += ` WHEN book_uuid = '${key}' THEN available_count - ${archivedCountObject[key]} `
                bulkQuery3Title += `'${key}',`
            }
            bulkQuery3Title = bulkQuery3Title.slice(0, -1);
            bulkQuery2Title += ` ELSE available_count END`
            bulkQuery3Title += ')'

            /*
            update book_titles set available_count = 
            case
                when book_uuid = 'uuid',
                when book_uuid = 'uuid',
                ...
            end
            else available_count where book_uuid in ('uuid', 'uuid', ....)
            */
            const finalQueryTitle = bulkQuery1Title + bulkQuery2Title + ' WHERE book_uuid IN ' + bulkQuery3Title;
            console.log(finalQueryTitle);
            await client.query(finalQueryTitle);
        }

        parentPort?.postMessage({
            archived_data: updatedDataCount,
            failed_archived_data: nonUpdatedDataCount
        } as TUpdateResult) ?? "Parent Port NULL"
    } catch (error) {
        let errorMessage = "Something went wrong while bulk archiving";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        parentPort?.postMessage(errorMessage) ?? "Parent Port NULL";
    }
    client.release(true);
})()