import { cpus } from "os";

const noOfCores = cpus().length / 2;

export function Chunkify(arr: any[]) {
    let arrlength = arr.length;
    let batchPerCore = arrlength / noOfCores;
    let newArr: any[][] = [];
    for(let i = 0 ; i < noOfCores ; i++) {
      batchPerCore = Math.ceil(batchPerCore);
      let rmEl = arr.splice(0, batchPerCore);
      newArr.push(rmEl);
    }
    return newArr;
}