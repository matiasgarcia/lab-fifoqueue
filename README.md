This is a lab to test sqs consumers and producers on a fifo queue.

- When using MessageGroupId, messages for a group are assigned to a specific consumer.
- It's up to the consumer to decide how messages will be processed. Whether if 1) in parallel, 2) sequentially
- To process sequentially you either poll 1 message at a time or write a strategy to poll many messages but process them sequentially.

Instructions:
1. npm run init
2. npm run produce
3. npm run consume (run this as much consumers you want to run at the same time)