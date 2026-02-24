"""Environment-based secrets."""

import os
from agent_framework.enterprise.secrets import SecretsProvider


class EnvSecretsProvider(SecretsProvider):
    async def get(self, key: str) -> str | None:
        return os.environ.get(key)
