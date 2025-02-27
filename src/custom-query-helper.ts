//creates Columns (col1, col2, ....), Arguments ($1, $2, ....) and Array of values [val1, val2, ....]
export function customQueryHelper(payloadObject: object) {
  let queryCol = '';
  let queryArg = '';
  let queryParamNum = 0;
  const values: string[] = [];
  for (let key in payloadObject) {
    queryParamNum++;
    queryCol = queryCol.concat(`${key},`);
    queryArg = queryArg.concat(`$${queryParamNum},`);
    values.push(payloadObject[key]);
  }
  queryArg = queryArg.slice(0, -1);
  queryCol = queryCol.slice(0, -1);
  return { queryArg, queryCol, values };
}
