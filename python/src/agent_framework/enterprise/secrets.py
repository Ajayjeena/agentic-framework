"""Secrets provider interface."""

from abc import ABC, abstractmethod


class SecretsProvider(ABC):
    @abstractmethod
    async def get(self, key: str) -> str | None:
        ...
