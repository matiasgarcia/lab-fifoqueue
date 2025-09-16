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
  // Track the next message number for each group
  const groupCounters = { 1: 1, 2: 1, 3: 1 };
  const maxMessages = 3;
  const groups = [1, 2, 3];
  
  // Continue until all groups have sent all their messages
  while (Object.values(groupCounters).some(counter => counter <= maxMessages)) {
    // Filter groups that still have messages to send
    const availableGroups = groups.filter(groupId => groupCounters[groupId] <= maxMessages);
    
    if (availableGroups.length === 0) break;
    
    // Randomly select a group from available groups
    const randomGroupId = availableGroups[Math.floor(Math.random() * availableGroups.length)];
    const messageNumber = groupCounters[randomGroupId];
    
    await sleep(100);
    await sqs.sendMessage({
      MessageBody: JSON.stringify({
        payload: `[${time}][G - ${randomGroupId}] Message ${messageNumber}`,
        groupId: randomGroupId,
      }),
      QueueUrl: queueUrl,
      MessageGroupId: `group_${randomGroupId}`,
      MessageDeduplicationId: `${time}_${randomGroupId}_${messageNumber}`
    }).promise();
    
    // Increment the counter for this group
    groupCounters[randomGroupId]++;
  }
}

run().then(console.log('done'))