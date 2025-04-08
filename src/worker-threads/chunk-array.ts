import { cpus } from 'os';

const noOfCores = 1; //Avoid manual assignment of values more than 1!

export function Chunkify(arr: any[]) {
  console.log('Batch size', noOfCores);
  let arrlength = arr.length;
  let batchPerCore = arrlength / noOfCores;
  let newArr: any[][] = [];
  for (let i = 0; i < noOfCores; i++) {
    batchPerCore = Math.ceil(batchPerCore);
    let rmEl = arr.splice(0, batchPerCore);
    newArr.push(rmEl);
  }
  return newArr;
}
