const AWS = require('aws-sdk');

// Configure AWS SDK to use LocalStack
AWS.config.update({
  region: 'us-east-1',
  accessKeyId: 'mock_access_key',
  secretAccessKey: 'mock_secret_key',
  endpoint: 'http://localhost:4599'
});

const sqs = new AWS.SQS();
const queueUrl = 'http://localhost:4599/000000000000/fifo-queue.fifo';

[1].forEach(groupId => {
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach(messageNumber => {
    const message = {
      MessageBody: `Message ${messageNumber} Group ${groupId}`,
      QueueUrl: queueUrl,
      MessageGroupId: `group${groupId}`,
      MessageDeduplicationId: `NEW920group${groupId}msg${messageNumber}`
    };

    sqs.sendMessage(message, (err, data) => {
      if (err) {
        console.error(`Error sending message: "${message.MessageBody}"`, err);
      } else {
        console.log(`Message sent: "${message.MessageBody}"`);
      }
    });    
  })
})
