"""Tool definition and result types."""

from pydantic import BaseModel
from typing import Any


class ToolDefinition(BaseModel):
    """Metadata for a tool."""

    name: str
    description: str | None = None


class ToolResult(BaseModel):
    """Result of a tool invocation."""

    success: bool
    data: Any = None
    error: str | None = None
