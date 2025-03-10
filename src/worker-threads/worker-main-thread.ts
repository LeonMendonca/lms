import { Worker } from "worker_threads";

export async function CreateWorker(oneDArray: any[], workerScriptName: string) {
  return new Promise((resolve, reject) => {
    //absolute path to JS file REQUIRED!
    console.log("spawned a new thread!")
    const worker = new Worker(`./dist/worker-threads/${workerScriptName}.js`, { workerData: { oneDArray }});
    worker.on('message', (data) => {
      resolve(data);
    });
    worker.on('error', (err) => {
      reject(err);
    })
  }) 
}
