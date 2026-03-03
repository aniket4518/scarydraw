import Bull from "bull";
import { prismaclient } from "@repo/db/client";
 
const REDIS_URL = process.env.REDIS_URL!;

if (!REDIS_URL) {
  throw new Error("REDIS_URL environment variable is required");
}

console.log("Redis Config: connecting to", new URL(REDIS_URL).hostname);

export const messageDeleteQueue = new Bull("message-deletion", REDIS_URL, {
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
  },
});

messageDeleteQueue.client.on("connect", () => {
  console.log("Redis connected successfully");
});

messageDeleteQueue.client.on("error", (err) => {
  console.error("Redis connection failed:", err);
});

messageDeleteQueue.process("delete-message", async (job) => {
  const { messageId, requestId } = job.data;
  console.log(
    `[Queue] Processing delete job for message ${messageId} (request: ${requestId})`,
  );

  try {
    const result = await prismaclient.$transaction(async (prisma: any) => {
      const existingMessage = await prisma.message.findUnique({
        where: {
          id: messageId,
        },
        include: {
          chat: true,
        },
      });

      if (!existingMessage) {
        console.log(`[Queue] Message ${messageId} not found`);
        throw new Error("MESSAGE_NOT_FOUND");
      }

      console.log(` [Queue] Found message ${messageId}, deleting...`);

      const deletedMessage = await prisma.message.delete({
        where: {
          id: messageId,
        },
      });

      return deletedMessage;
    });

    console.log(`[Queue] Message ${messageId} deleted successfully`);

    return {
      success: true,
      deleted: result,
      messageId,
      requestId,
      deletedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`[Queue] Failed to delete message ${messageId}:`, error);

    if (error instanceof Error && error.message === "MESSAGE_NOT_FOUND") {
      const notFoundError = new Error("MESSAGE_NOT_FOUND");
      (notFoundError as any).isRetryable = false;
      throw notFoundError;
    }

    throw error;
  }
});

messageDeleteQueue.on("completed", (job, result) => {
  console.log(` [Queue] Delete job completed for message ${result.messageId}`);
});

messageDeleteQueue.on("failed", (job, err) => {
  console.error(
    `[Queue] Delete job failed for message ${job.data.messageId}:`,
    err.message,
  );

  if (job.attemptsMade >= (job.opts.attempts || 1)) {
    console.error(
      ` [Queue] Message ${job.data.messageId} failed permanently after ${job.attemptsMade} attempts`,
    );
  }
});

messageDeleteQueue.on("stalled", (job) => {
  console.warn(`[Queue] Delete job stalled for message ${job.data.messageId}`);
});

export async function getQueueStats() {
  try {
    const waiting = await messageDeleteQueue.getWaiting();
    const active = await messageDeleteQueue.getActive();
    const completed = await messageDeleteQueue.getCompleted();
    const failed = await messageDeleteQueue.getFailed();

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
    };
  } catch (error) {
    console.error(" Queue stats error:", error);
    return {
      error: "Failed to get stats",
      waiting: 0,
      active: 0,
      completed: 0,
      failed: 0,
    };
  }
}

export default messageDeleteQueue;
