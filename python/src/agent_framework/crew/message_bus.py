"""Message bus: central pool for multi-agent communication."""

from abc import ABC, abstractmethod
from typing import Any, Callable, Awaitable
from typing import Protocol

ChannelId = str


class BusMessage:
    """A message on the bus."""

    def __init__(
        self,
        channel: str,
        sender_id: str,
        payload: Any,
        timestamp: float,
        message_id: str | None = None,
    ):
        self.channel = channel
        self.sender_id = sender_id
        self.payload = payload
        self.timestamp = timestamp
        self.message_id = message_id


MessageHandler = Callable[[BusMessage], Awaitable[None] | None]


class MessageBus(Protocol):
    """Message bus interface."""

    async def publish(
        self,
        channel: str,
        sender_id: str,
        payload: Any,
    ) -> None: ...

    def subscribe(
        self,
        channel: str,
        handler: MessageHandler,
    ) -> Callable[[], None]: ...
