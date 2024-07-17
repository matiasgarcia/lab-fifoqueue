This is a lab to test sqs consumers and producers on a fifo queue.

- When using MessageGroupId, messages for a group are assigned to a specific consumer.
- It's up to the consumer to decide how messages will be processed. Whether if 1) in parallel, 2) sequentially
- To process sequentially you either poll 1 message at a time or write a strategy to poll many messages but process them sequentially.

Instructions:
1. npm run init
2. npm run produce
3. npm run consume-parallel OR npm run consume-sequential (run this as much message groups you want to process at the same)

## Conclusion

When using node produce.js, we see that messages are sent in order:

```
Message sent: "[2024-07-17T17:14:45.682Z][G - 1] Message 1"
Message sent: "[2024-07-17T17:14:45.682Z][G - 1] Message 2"
Message sent: "[2024-07-17T17:14:45.682Z][G - 1] Message 3"
Message sent: "[2024-07-17T17:14:45.682Z][G - 1] Message 4"
Message sent: "[2024-07-17T17:14:45.682Z][G - 1] Message 5"
Message sent: "[2024-07-17T17:14:45.682Z][G - 1] Message 6"
Message sent: "[2024-07-17T17:14:45.682Z][G - 1] Message 7"
Message sent: "[2024-07-17T17:14:45.682Z][G - 1] Message 8"
Message sent: "[2024-07-17T17:14:45.682Z][G - 1] Message 9"
Message sent: "[2024-07-17T17:14:45.682Z][G - 1] Message 10"
```

However, when using node consumer.mjs with batchSize > 1, messages will be processed out of order

```
Done consuming message: [2024-07-17T17:19:27.052Z][G - 1] Message 8 2024-07-17T17:19:29.765Z
Done consuming message: [2024-07-17T17:19:27.052Z][G - 1] Message 1 2024-07-17T17:19:29.813Z
Done consuming message: [2024-07-17T17:19:27.052Z][G - 1] Message 7 2024-07-17T17:19:29.822Z
Done consuming message: [2024-07-17T17:19:27.052Z][G - 1] Message 9 2024-07-17T17:19:29.858Z
Done consuming message: [2024-07-17T17:19:27.052Z][G - 1] Message 3 2024-07-17T17:19:29.971Z
Done consuming message: [2024-07-17T17:19:27.052Z][G - 1] Message 4 2024-07-17T17:19:29.989Z
Done consuming message: [2024-07-17T17:19:27.052Z][G - 1] Message 5 2024-07-17T17:19:30.003Z
Done consuming message: [2024-07-17T17:19:27.052Z][G - 1] Message 6 2024-07-17T17:19:30.036Z
Done consuming message: [2024-07-17T17:19:27.052Z][G - 1] Message 10 2024-07-17T17:19:30.039Z
Done consuming message: [2024-07-17T17:19:27.052Z][G - 1] Message 2 2024-07-17T17:19:30.087Z
```

When using sequential-consumer.mjs, messages are processed in order

```
Done consuming message: [2024-07-17T17:30:35.395Z][G - 1] Message 1 2024-07-17T17:31:16.532Z
Done consuming message: [2024-07-17T17:30:35.395Z][G - 1] Message 2 2024-07-17T17:31:16.733Z
Done consuming message: [2024-07-17T17:30:35.395Z][G - 1] Message 3 2024-07-17T17:31:16.939Z
Done consuming message: [2024-07-17T17:30:35.395Z][G - 1] Message 4 2024-07-17T17:31:17.241Z
Done consuming message: [2024-07-17T17:30:35.395Z][G - 1] Message 5 2024-07-17T17:31:17.576Z
Done consuming message: [2024-07-17T17:30:35.395Z][G - 1] Message 6 2024-07-17T17:31:17.899Z
Done consuming message: [2024-07-17T17:30:35.395Z][G - 1] Message 7 2024-07-17T17:31:18.075Z
Done consuming message: [2024-07-17T17:30:35.395Z][G - 1] Message 8 2024-07-17T17:31:18.366Z
Done consuming message: [2024-07-17T17:30:35.395Z][G - 1] Message 9 2024-07-17T17:31:18.501Z
Done consuming message: [2024-07-17T17:30:35.395Z][G - 1] Message 10 2024-07-17T17:31:18.990Z
```

One caveat here is the visibilityTimeout that can lead to processing more than once a message for the same group in different producers.
You can reproduce this doing the following:

1. Modify sequential-consumer.mjs visibilityTimeout to 1, remove `heartbeatInterval`
2. Change `sleep()` to something like this `await sleep(1000 + rand());`
3. Run `node producer.js`
4. Run in two different terminals `node sequential-consumer.mjs`
5. You should see that both of them are processing messages for the same consumer group at the same time.

Why this happens?
- Because when pulling messages from the queue, SQS will return 10 messages that belong to a ConsumerGroup.
- At that moment, the message is assigned the visibilityTimeout. This time reflects how much time it will wait SQS to resend the message unless acked.
- Since our code processes each message sequentially, it could happen that it processes 3 or 4 messages but it hasn't acked yet, so SQS resends the messages to another consumer, provoking the same message being executed more than once.

Hence, you need `heartbeatInterval` in sqs-consumer. This basically tells sqs that we are still processing the message and it doesn't have to forward it to another consumer yet.


[sequential processing per message group](https://drive.google.com/file/d/1Ew_ZHKOnrsbZMlBGHhWcx81vnpzBSkV-/view?usp=sharing)
[parallel and disordered message processing per message group](https://drive.google.com/file/d/15AdpmFAoqY3V3Cqx5f-Kqmdf8dKcymFB/view?usp=sharing)

## Utils

```
aws --endpoint-url http://localhost:4599 sqs get-queue-attributes --queue-url http://localhost:4599/000000000000/fifo-queue.fifo --attribute-names ApproximateNumberOfMessages
```