import { Worker, isMainThread } from "worker_threads";
import { zodToJsonSchema } from "zod-to-json-schema";
import { ZodSchema } from "zod";
import { Repository } from "typeorm";

console.log(isMainThread)
export async function CreateWorker<T extends object>(oneDArray: any[], workerScriptName: string, repository?: Repository<T>) {
    return new Promise((resolve, reject) => {
        //absolute path to JS file REQUIRED!
        const worker = new Worker(`./dist/worker-threads/${workerScriptName}.js`, { workerData: { oneDArray, repository }});
        worker.on('message', (data) => {
            resolve(data);
        });
        worker.on('error', (err) => {
            reject(err);
        })
    }) 
}