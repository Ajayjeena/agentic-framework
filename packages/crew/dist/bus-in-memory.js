import { randomUUID } from "crypto";
/**
 * In-memory message bus: agents subscribe to channels and receive published messages.
 */
export class InMemoryMessageBus {
    handlers = new Map();
    async publish(message) {
        const full = {
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
    subscribe(channel, handler) {
        if (!this.handlers.has(channel)) {
            this.handlers.set(channel, new Set());
        }
        this.handlers.get(channel).add(handler);
        return () => {
            this.handlers.get(channel)?.delete(handler);
        };
    }
}
//# sourceMappingURL=bus-in-memory.js.map