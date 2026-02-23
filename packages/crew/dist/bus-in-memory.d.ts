import type { BusMessage, MessageBus, MessageHandler } from "./message-bus.js";
/**
 * In-memory message bus: agents subscribe to channels and receive published messages.
 */
export declare class InMemoryMessageBus implements MessageBus {
    private handlers;
    publish(message: Omit<BusMessage, "timestamp" | "messageId">): Promise<void>;
    subscribe(channel: string, handler: MessageHandler): () => void;
}
//# sourceMappingURL=bus-in-memory.d.ts.map