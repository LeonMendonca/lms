import { parentPort, workerData } from 'worker_threads';
import { TstudentUUIDZod } from 'src/students/zod-validation/studentuuid-zod';
import { pool } from '../../pg.connect';

export type TUpdateResult = {
  archived_data: number;
  failed_archived_data: number;
};

(async () => {
  let client = await pool.connect();

  client.on('error', (err) => {
    console.error('Pool Client in ARCHIVE worker emitted error', err.message);
  });

  let arrOfUUID = workerData.oneDArray as TstudentUUIDZod[];

  //Count payload being updated
  const updatePayloadCount = arrOfUUID.length;

  let bulkQuery1 =
    'UPDATE students_table SET is_archived = TRUE WHERE student_uuid IN ';

  let bulkQuery2 = '(';
  for (const element of arrOfUUID) {
    bulkQuery2 += `'${element}',`;
  }
  bulkQuery2 = bulkQuery2.slice(0, -1);
  bulkQuery2 += ')';

  let bulkQuery3 = 'AND is_archived = FALSE RETURNING student_uuid';

  const finalQuery = bulkQuery1 + bulkQuery2 + bulkQuery3;

  // console.log("FINAL QUERY", finalQuery)
  try {
    const result = await client.query(finalQuery);

    const updatedDataCount = result.rowCount ?? 0;
    const nonUpdatedDataCount = updatePayloadCount - updatedDataCount;

    parentPort?.postMessage({
      archived_data: updatedDataCount,
      failed_archived_data: nonUpdatedDataCount,
    } as TUpdateResult) ?? 'Parent Port NULL';
  } catch (error) {
    let errorMessage = 'Something went wrong while bulk archiving';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    parentPort?.postMessage(errorMessage) ?? 'Parent Port NULL';
  }
  client.release(true);
})();
