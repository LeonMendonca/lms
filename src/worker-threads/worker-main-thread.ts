import { Worker } from 'worker_threads';

export async function CreateWorkerQuery<T>(
  oneDArray,
  workerScriptName: string,
) {}

export async function CreateWorker<T>(
  //Unsure about the type being returned
  oneDArray: any[],
  workerScriptName: string,
): Promise<T> {
  console.log('MAIN Woker thread is called!');
  return new Promise((resolve, reject) => {
    //absolute path to JS file REQUIRED!
    //console.log("Data received", oneDArray);
    const start = Date.now();
    const worker = new Worker(
      `./dist/src/worker-threads/${workerScriptName}.js`,
      { workerData: { oneDArray } },
    );
    worker.on('message', (data) => {
      console.log('create worker resolved', Date.now() - start, 'ms');
      return resolve(data);
    });
    worker.on('error', (err) => {
      console.log('error is', err);
      console.log('create worker rejected', Date.now() - start, 'ms');
      return reject(err);
    });
  });
}
