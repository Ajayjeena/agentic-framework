"""In-memory message bus."""

import uuid
import time
from collections.abc import Callable
from agent_framework.crew.message_bus import MessageBus, BusMessage, MessageHandler


class InMemoryMessageBus:
    """In-memory message bus."""

    def __init__(self) -> None:
        self._handlers: dict[str, set[MessageHandler]] = {}

    async def publish(self, channel: str, sender_id: str, payload: object) -> None:
        msg = BusMessage(
            channel=channel,
            sender_id=sender_id,
            payload=payload,
            timestamp=time.time(),
            message_id=str(uuid.uuid4()),
        )
        handlers = self._handlers.get(channel, set())
        for h in handlers:
            result = h(msg)
            if hasattr(result, "__await__"):
                await result

    def subscribe(self, channel: str, handler: MessageHandler) -> Callable[[], None]:
        if channel not in self._handlers:
            self._handlers[channel] = set()
        self._handlers[channel].add(handler)

        def unsubscribe() -> None:
            self._handlers.get(channel, set()).discard(handler)

        return unsubscribe
