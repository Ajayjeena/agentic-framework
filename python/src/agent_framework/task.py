"""Task: unit of work assigned to an agent or crew."""

from pydantic import BaseModel
from typing import Any


class Task(BaseModel):
    """A unit of work."""

    id: str
    description: str
    agent_id: str | None = None
    input: dict[str, Any] | None = None
    output: Any = None
