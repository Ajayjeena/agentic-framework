/**
 * Message bus: central pool for multi-agent communication (MetaGPT-style).
 * Agents publish/subscribe to channels; decoupled coordination.
 */
export type ChannelId = string;
export interface BusMessage {
    channel: ChannelId;
    senderId: string;
    payload: unknown;
    timestamp: number;
    messageId?: string;
}
export type MessageHandler = (message: BusMessage) => void | Promise<void>;
export interface MessageBus {
    publish(message: Omit<BusMessage, "timestamp" | "messageId">): Promise<void>;
    subscribe(channel: ChannelId, handler: MessageHandler): () => void;
}
//# sourceMappingURL=message-bus.d.ts.map