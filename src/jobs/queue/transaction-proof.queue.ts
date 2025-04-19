import { Queue } from "bullmq";
import { redisConnection } from "../../lib/redis";

export const userTransactionProofQueue = new Queue("user-transaction-proof-queue", {
  connection: redisConnection,
});