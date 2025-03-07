import { Worker } from "worker_threads";

export async function CreateWorker(oneDArray: any[], workerScriptName: string) {
  return new Promise((resolve, reject) => {
    //absolute path to JS file REQUIRED!
    const worker = new Worker(`./dist/worker-threads/${workerScriptName}.js`, { workerData: { oneDArray }});
    worker.on('message', (data) => {
      resolve(data);
    });
    worker.on('error', (err) => {
      reject(err);
    })
  }) 
}
