import { TCreateBookZodDTO } from 'src/books_v2/zod/createbookdtozod';
import { parentPort, workerData } from 'worker_threads';
import { pool } from '../../pg.connect';
import { insertQueryHelper } from 'src/misc/custom-query-helper';
import { createObjectOmitProperties } from 'src/misc/create-object-from-class';

const bookPayloadArr = workerData.oneDArray as TCreateBookZodDTO[];

(async () => {
  let client = await pool.connect();

  client.on('error', (err) => {
    console.error('Pool Client in INSERT worker emitted error', err.message);
  });

  //COPIES

  //   let bulkQuery1Copies = 'INSERT INTO book_copies ';
  //   let bulkQuery2Copies = '';
  //   let bulkQuery3Copies = '';

  //   let columnsOfBookCopies = createObjectOmitProperties(bookPayloadArr[0], [
  //     'book_title',
  //     'book_author',
  //     'name_of_publisher',
  //     'place_of_publication',
  //     'year_of_publication',
  //     'edition',
  //     'isbn',
  //     'no_of_pages',
  //     'no_of_preliminary',
  //     'subject',
  //     'department',
  //     'call_number',
  //     'author_mark',
  //     'title_images',
  //     'title_description',
  //     'title_additional_fields',
  //   ]);
  //   let key: keyof typeof columnsOfBookCopies | '' = '';

  //   //Create columns with object received for book_copies table
  //   bulkQuery2Copies += '(';
  //   for (key in columnsOfBookCopies) {
  //     bulkQuery2Copies = bulkQuery2Copies.concat(`${key},`);
  //   }
  //   bulkQuery2Copies = bulkQuery2Copies.slice(0, -1);
  //   bulkQuery2Copies += ')';
  //   bulkQuery2Copies += ' VALUES ';

  //   for (const bookCopyObj of bookPayloadArr) {
  //     bulkQuery3Copies += '(';
  //     for (let key in bookCopyObj) {
  //       if (key in columnsOfBookCopies) {
  //         if (typeof bookCopyObj[key] === 'object') {
  //           bookCopyObj[key] = JSON.stringify(bookCopyObj[key]);
  //         }
  //         if (typeof bookCopyObj[key] === 'string') {
  //           bulkQuery3Copies += `'${bookCopyObj[key]}',`;
  //         } else {
  //           bulkQuery3Copies += `${bookCopyObj[key]},`;
  //         }
  //       }
  //       //Convert some specific fields to string
  //     }
  //     bulkQuery3Copies = bulkQuery3Copies.slice(0, -1);
  //     bulkQuery3Copies += '),';
  //   }
  //   bulkQuery3Copies = bulkQuery3Copies.slice(0, -1);

  //   console.log('test', bulkQuery1Copies + bulkQuery2Copies + bulkQuery3Copies);

  const isbnCountObject = new Object() as { [key: string]: number };

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

  let bulkQueryEnd = `WHERE isbn IN (${isbnList}) RETURNING isbn, book_uuid`;

  const finalQueryTitle =
    bulkQueryUpdateTitle +
    bulkQueryUpdateAvailableCount +
    bulkQueryUpdateTotalCount +
    bulkQueryEnd;

  const createColumnsFromObject = bookPayloadArr[0];

  const columnsOfBookTitle = createObjectOmitProperties(
    createColumnsFromObject,
    [
      'source_of_acquisition',
      'date_of_acquisition',
      'bill_no',
      'language',
      'inventory_number',
      'accession_number',
      'barcode',
      'item_type',
      'institute_name',
      'institute_uuid',
      'created_by',
      'remarks',
      'copy_images',
      'copy_description',
      'copy_additional_fields',
    ],
  );

  //When inserting to book_titles, the count needs to be calculated
  let uniqueArrayOfBookTitle: (TCreateBookZodDTO & {
    available_count: number;
    total_count: number;
  })[] = [];

  //console.log('FINAL QUERY', finalQueryTitle);
  try {
    //Update book_titles table that have existing ISBNs
    const updatedISBN = await client.query(finalQueryTitle);
    console.log('Updated ISBN', updatedISBN.rows);
    for (let element of updatedISBN.rows) {
      if (element.isbn in isbnCountObject) {
        //If the ISBN is updated, remove it from the object
        //This can be used to INSERT new ISBNs in book_titles table
        delete isbnCountObject[element.isbn];
      }
    }

    for (let insertIsbn in isbnCountObject) {
      bookPayloadArr.forEach((item) => {
        if (insertIsbn === item.isbn) {
          let uniqueArrayOfBookTitleElement = Object.assign(item, {
            available_count: isbnCountObject[insertIsbn],
            total_count: isbnCountObject[insertIsbn],
          });
          if (
            !uniqueArrayOfBookTitle.some(
              (existingItem) =>
                existingItem.isbn === uniqueArrayOfBookTitleElement.isbn,
            )
          ) {
            console.log('Now pushing ', uniqueArrayOfBookTitleElement.isbn);
            uniqueArrayOfBookTitle.push(uniqueArrayOfBookTitleElement);
          }
        }
      });
    }

    console.log('Object of Array', uniqueArrayOfBookTitle);

    // console.log('Unupdated ISBN Object', isbnCountObject);
    parentPort?.postMessage('updated!') ?? 'Parent port is null';
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
