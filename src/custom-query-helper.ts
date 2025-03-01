//creates Columns (col1, col2, ....), Arguments ($1, $2, ....) and Array of values [val1, val2, ....]
export function insertQueryHelper<T extends object>(
  payloadObject: T,
  ignoreField: (keyof T)[],
) {
  let queryCol = '';
  let queryArg = '';
  let queryParamNum = 0;
  const values: string[] = [];
  for (let key in payloadObject) {
    if (ignoreField.includes(key)) {
      continue;
    }
    queryParamNum++;
    queryCol = queryCol.concat(`${key},`);
    queryArg = queryArg.concat(`$${queryParamNum},`);
    values.push(payloadObject[key] as string);
  }
  queryArg = queryArg.slice(0, -1);
  queryCol = queryCol.slice(0, -1);
  return { queryArg, queryCol, values };
}

//creates Columns with Query Arguement (col1 = $1, col2 = $2, ....) and Array of values [val1, val2, ....]
export function updateQueryHelper<T extends object>(payloadObject: T, ignoreField: (keyof T)[]) {
  let queryCol = '';
  let queryParamNum = 0;
  const values: string[] = [];
  for (let key in payloadObject) {
    if(ignoreField.includes(key)) {
      continue;
    }
    queryParamNum++;
    queryCol = queryCol.concat(`${key} = $${queryParamNum},`);
    values.push(payloadObject[key] as string);
  }
  queryCol = queryCol.slice(0, -1);
  return { queryCol, values };
}
