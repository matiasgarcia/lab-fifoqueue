import { Consumer } from "sqs-consumer";
import { SQSClient } from "@aws-sdk/client-sqs";

export async function sleep(delayMs) {
  return await new Promise((resolve) => setTimeout(resolve, delayMs));
}

// Generates a random number between 100 and 500
function rand() {
  return Math.floor(Math.random() * (500 - 100 + 1)) + 100;
}

const app = Consumer.create({
  queueUrl: "http://localhost:4599/000000000000/fifo-queue.fifo",
  batchSize: 10,
  waitTimeSeconds: 0,
  visibilityTimeout: 20,
  handleMessage: async (message) => {
    await sleep(rand()); // simulate different workload
    console.log('Done consuming message:', message.Body, new Date().toISOString())
  },
  sqs: new SQSClient({
    region: 'us-east-1',
    credentials: {
      accessKeyId: 'mock_access_key',
      secretAccessKey: 'mock_secret_key',
    },
    endpoint: 'http://localhost:4599'
  })
});

app.on("error", (err) => {
  console.error('Error on consumer', err.message);
});

app.on("processing_error", (err) => {
  console.error('Error processing message', err.message);
});

app.on('started', () => console.log('started consuming'))

app.start();
