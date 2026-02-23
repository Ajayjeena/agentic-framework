"""Crew definition and context (core primitives)."""

from pydantic import BaseModel, Field
from typing import Literal
from agent_framework.agent import AgentDefinition
from agent_framework.task import Task
from agent_framework.tool import ToolDefinition


class CrewDefinition(BaseModel):
    """Crew: agents, tasks, tools, execution order."""

    id: str
    agent_ids: list[str]
    task_ids: list[str]
    tool_names: list[str] | None = None
    execution_order: Literal["sequential", "parallel", "graph"] = "sequential"


class CrewContext(BaseModel):
    """Resolved crew context with full agent/task/tool maps."""

    crew: CrewDefinition
    agents: dict[str, AgentDefinition] = Field(default_factory=dict)
    tasks: dict[str, Task] = Field(default_factory=dict)
    tools: dict[str, ToolDefinition] = Field(default_factory=dict)
