import { randomUUID } from "crypto";
import type { BusMessage, MessageBus, MessageHandler } from "./message-bus.js";

/**
 * In-memory message bus: agents subscribe to channels and receive published messages.
 */
export class InMemoryMessageBus implements MessageBus {
  private handlers = new Map<string, Set<MessageHandler>>();

  async publish(message: Omit<BusMessage, "timestamp" | "messageId">): Promise<void> {
    const full: BusMessage = {
      ...message,
      timestamp: Date.now() / 1000,
      messageId: randomUUID(),
    };
    const set = this.handlers.get(message.channel);
    if (set) {
      for (const h of set) {
        await Promise.resolve(h(full));
      }
    }
  }

  subscribe(channel: string, handler: MessageHandler): () => void {
    if (!this.handlers.has(channel)) {
      this.handlers.set(channel, new Set());
    }
    this.handlers.get(channel)!.add(handler);
    return () => {
      this.handlers.get(channel)?.delete(handler);
    };
  }
}
