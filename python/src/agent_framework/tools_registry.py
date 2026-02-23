"""Tool registry with validation."""

from typing import Any, Callable, Awaitable, Protocol
from agent_framework.tool import ToolResult


class RegisteredTool(Protocol):
    """A registered tool with optional schema and execute."""

    name: str
    description: str | None
    execute: Callable[..., Awaitable[Any]]


class ToolRegistry(Protocol):
    """Tool registry interface."""

    def register(self, tool: RegisteredTool) -> None: ...
    def get(self, name: str) -> RegisteredTool | None: ...
    def list(self) -> list[RegisteredTool]: ...
    async def execute(self, name: str, input: Any) -> ToolResult: ...


class InMemoryToolRegistry:
    """In-memory tool registry."""

    def __init__(self) -> None:
        self._tools: dict[str, Any] = {}

    def register(self, tool: Any) -> None:
        self._tools[tool.name] = tool

    def get(self, name: str) -> Any:
        return self._tools.get(name)

    def list(self) -> list[Any]:
        return list(self._tools.values())

    async def execute(self, name: str, input: Any) -> ToolResult:
        tool = self._tools.get(name)
        if not tool:
            return ToolResult(success=False, error=f"Tool not found: {name}")
        try:
            result = await tool.execute(input)
            return ToolResult(success=True, data=result)
        except Exception as e:
            return ToolResult(success=False, error=str(e))
