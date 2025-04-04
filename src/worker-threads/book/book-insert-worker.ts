import { TCreateBookZodDTO } from 'src/books_v2/zod/createbookdtozod';
import { parentPort, workerData } from 'worker_threads';
import { pool } from '../../pg.connect';
import { insertQueryHelper } from 'src/misc/custom-query-helper';
import { createObjectOmitProperties } from 'src/misc/create-object-from-class';
import {
  book_title,
  bookTitleObject,
} from 'src/books_v2/entity/books_v2.title.entity';
import { bookCopyObject } from 'src/books_v2/entity/books_v2.copies.entity';
import { TInsertResult } from '../worker-types/book-insert.type';

const bookPayloadArr = workerData.oneDArray as TCreateBookZodDTO[];

type QueryReturnType = {
  book_uuid: string;
  isbn: string;
};

(async () => {
  let client = await pool.connect();

  client.on('error', (err) => {
    console.error('Pool Client in INSERT worker emitted error', err.message);
  });

  const isbnCountObject = new Object() as { [key: string]: number };

  //An array which has UUIDs and ISBNs after UPDATE and INSERT
  const arrOfIsbnUUID: QueryReturnType[] = [];

  //Create an object of ISBNs along with counts
  for (let element of bookPayloadArr) {
    if (element.isbn in isbnCountObject) {
      isbnCountObject[element.isbn]++;
    } else {
      isbnCountObject[element.isbn] = 1;
    }
  }

  let isbnList = '';
  for (let key in isbnCountObject) {
    isbnList += `'${key}',`;
  }
  isbnList = isbnList.slice(0, -1);

  let bulkQueryUpdateTitle = `UPDATE book_titles SET `;
  let bulkQueryUpdateAvailableCount = `available_count = CASE `;
  let bulkQueryUpdateTotalCount = `total_count = CASE `;

  for (let isbnKey in isbnCountObject) {
    bulkQueryUpdateAvailableCount += `WHEN isbn = '${isbnKey}' THEN available_count + ${isbnCountObject[isbnKey]} `;
    bulkQueryUpdateTotalCount += `WHEN isbn = '${isbnKey}' THEN total_count + ${isbnCountObject[isbnKey]} `;
  }

  bulkQueryUpdateAvailableCount += `ELSE available_count END, `;
  bulkQueryUpdateTotalCount += `ELSE total_count END `;

  let bulkQueryUpdateEnd = `WHERE isbn IN (${isbnList}) RETURNING isbn, book_uuid`;

  const finalUpdateQueryTitle =
    bulkQueryUpdateTitle +
    bulkQueryUpdateAvailableCount +
    bulkQueryUpdateTotalCount +
    bulkQueryUpdateEnd;

  //When inserting to book_titles, the count needs to be calculated
  let uniqueArrayOfBookTitleWithCount: (TCreateBookZodDTO & {
    available_count: number;
    total_count: number;
  })[] = [];

  //console.log('FINAL QUERY', finalUpdateQueryTitle);
  try {
    //Update book_titles table that have existing ISBNs
    //Returns updated isbn, and book_uuid
    const updatedISBN = await client.query(finalUpdateQueryTitle);
    const isbnUUIDUpdate = updatedISBN.rows as QueryReturnType[];
    if (isbnUUIDUpdate.length) {
      for (let element of isbnUUIDUpdate) {
        arrOfIsbnUUID.push(element);
      }
    }
    //console.log('Updated ISBN', updatedISBN.rows);
    for (let element of updatedISBN.rows) {
      if (element.isbn in isbnCountObject) {
        //If the ISBN is updated, remove it from the object
        //This can be used to INSERT new books with new ISBNs in book_titles table
        delete isbnCountObject[element.isbn];
      }
    }

    //console.log('ISBN COUNT', isbnCountObject);

    for (let isbnTobeInserted in isbnCountObject) {
      bookPayloadArr.forEach((item) => {
        if (isbnTobeInserted === item.isbn) {
          let uniqueArrayOfBookTitleElement = Object.assign(item, {
            available_count: isbnCountObject[isbnTobeInserted],
            total_count: isbnCountObject[isbnTobeInserted],
          });
          if (
            !uniqueArrayOfBookTitleWithCount.some(
              (existingItem) =>
                existingItem.isbn === uniqueArrayOfBookTitleElement.isbn,
            )
          ) {
            //console.log('Now pushing ', uniqueArrayOfBookTitleElement.isbn);
            uniqueArrayOfBookTitleWithCount.push(uniqueArrayOfBookTitleElement);
          }
        }
      });
    }

    //If anything is pushed to array, it means that there exists data that needs to be inserted
    if (uniqueArrayOfBookTitleWithCount.length) {
      const createColumnsFromTitleObject = bookTitleObject;
      //Object.assign(, { available_count: 0, total_count: 0 });

      let bulkQuery1Title = 'INSERT INTO book_titles ';
      let bulkQuery2Title = '(';
      let bulkQuery3Title = '';
      const bulkQuery4Title = 'RETURNING book_uuid, isbn';

      for (let key in createColumnsFromTitleObject) {
        bulkQuery2Title += `${key},`;
      }
      bulkQuery2Title = bulkQuery2Title.slice(0, -1);
      bulkQuery2Title += ')';
      bulkQuery2Title += ' VALUES ';

      let titleKey: keyof typeof createColumnsFromTitleObject | '' = '';

      for (let element of uniqueArrayOfBookTitleWithCount) {
        bulkQuery3Title += '(';
        for (titleKey in createColumnsFromTitleObject) {
          if (titleKey in element) {
            if (typeof element[titleKey] === 'string') {
              bulkQuery3Title += `'${element[titleKey]}',`;
            } else if (typeof element[titleKey] === 'number') {
              bulkQuery3Title += `${element[titleKey]},`;
            } else {
              bulkQuery3Title += `'${JSON.stringify(element[titleKey])}',`;
            }
          } else {
            if (
              titleKey === 'title_images' ||
              titleKey === 'title_additional_fields' ||
              titleKey === 'title_description'
            ) {
              bulkQuery3Title += `NULL,`;
            }
          }
        }
        bulkQuery3Title = bulkQuery3Title.slice(0, -1);
        bulkQuery3Title += '),';
      }
      bulkQuery3Title = bulkQuery3Title.slice(0, -1);

      const finalInsertQueryTitle =
        bulkQuery1Title + bulkQuery2Title + bulkQuery3Title + bulkQuery4Title;
      //console.log(finalInsertQueryTitle);
      const insertedResult = await client.query(finalInsertQueryTitle);
      const isbnUUIDInsert = insertedResult.rows as QueryReturnType[];
      if (isbnUUIDInsert.length) {
        for (let element of isbnUUIDInsert) {
          arrOfIsbnUUID.push(element);
        }
      }
    }
    //console.log('ISBN with UUID', arrOfIsbnUUID);

    const createColumnsFromCopiesObject = bookCopyObject;

    let bulkQuery1Copies = 'INSERT INTO book_copies ';
    let bulkQuery2Copies = '(';
    let bulkQuery3Copies = '';

    for (let key in createColumnsFromCopiesObject) {
      bulkQuery2Copies += `${key},`;
    }
    bulkQuery2Copies = bulkQuery2Copies.slice(0, -1);
    bulkQuery2Copies += ')';
    bulkQuery2Copies += ' VALUES ';

    let copiesKey: keyof typeof createColumnsFromCopiesObject | '' = '';

    for (let element of bookPayloadArr) {
      bulkQuery3Copies += '(';
      for (copiesKey in createColumnsFromCopiesObject) {
        if (copiesKey in element) {
          if (typeof element[copiesKey] === 'string') {
            bulkQuery3Copies += `'${element[copiesKey]}',`;
          } else if (typeof element[copiesKey] === 'number') {
            bulkQuery3Copies += `${element[copiesKey]},`;
          } else {
            bulkQuery3Copies += `'${JSON.stringify(element[copiesKey])}',`;
          }
        } else {
          if (
            copiesKey === 'copy_images' ||
            copiesKey === 'copy_additional_fields' ||
            copiesKey === 'copy_description' ||
            copiesKey === 'remarks' ||
            copiesKey === 'institute_uuid' ||
            copiesKey === 'created_by' ||
            copiesKey === 'inventory_number'
          ) {
            bulkQuery3Copies += `NULL,`;
          } else if (copiesKey === 'book_title_uuid') {
            arrOfIsbnUUID.forEach((item) => {
              if (element.isbn === item.isbn) {
                bulkQuery3Copies += `'${item.book_uuid}',`;
              }
            });
          }
        }
      }
      bulkQuery3Copies = bulkQuery3Copies.slice(0, -1);
      bulkQuery3Copies += '),';
    }
    bulkQuery3Copies = bulkQuery3Copies.slice(0, -1);

    const finalInsertQueryCopies =
      bulkQuery1Copies + bulkQuery2Copies + bulkQuery3Copies;
    // console.log(finalInsertQueryCopies);

    const insertedCopies = await client.query(finalInsertQueryCopies);
    parentPort?.postMessage({
      inserted_data: insertedCopies.rowCount ?? 0,
    } as TInsertResult) ?? 'Parent port is null';
    // parentPort?.postMessage({ inserted_data: 'x' }) ?? 'Parent port is null';
  } catch (error) {
    let errorMessage = 'Something went wrong while bulk inserting';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    //console.log("this insert worker ended at", Date.now() - start, 'ms', false);
    parentPort?.postMessage(errorMessage) ?? 'Parent port is null';
  }
  client.release(true);
})();
