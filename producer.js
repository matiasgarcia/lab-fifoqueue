const AWS = require('aws-sdk');

// Configure AWS SDK to use LocalStack
AWS.config.update({
  region: 'us-east-1',
  accessKeyId: 'mock_access_key',
  secretAccessKey: 'mock_secret_key',
  endpoint: 'http://localhost:4599'
});

async function sleep(delayMs) {
  return await new Promise((resolve) => setTimeout(resolve, delayMs));
}

const sqs = new AWS.SQS();
const queueUrl = 'http://localhost:4599/000000000000/fifo-queue.fifo';

const time = new Date().toISOString();

async function run() {
  for (const groupId of [1, 2, 3]) {
    for(const messageNumber of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
      const message = {
        MessageBody: `[${time}][G - ${groupId}] Message ${messageNumber}`,
        QueueUrl: queueUrl,
        MessageGroupId: `group_${groupId}`,
        MessageDeduplicationId: `${time}_${groupId}_${messageNumber}`
      };

      await sleep(100);
      await sqs.sendMessage(message).promise();
      console.log(`Message sent: "${message.MessageBody}"`);
    }
  }
}

run().then(console.log('done'))