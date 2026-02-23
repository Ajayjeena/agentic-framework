"""Crew orchestrator: runs Crew with optional message bus."""

from typing import Any
from agent_framework.crew.models import CrewContext
from agent_framework.crew.message_bus import MessageBus


class CrewRunOptions:
    """Options for a crew run."""

    def __init__(
        self,
        thread_id: str = "default",
        initial_input: dict[str, Any] | None = None,
    ):
        self.thread_id = thread_id
        self.initial_input = initial_input or {}


class CrewRunResult:
    """Result of a crew run."""

    def __init__(
        self,
        outputs: dict[str, Any],
        completed_task_ids: list[str],
    ):
        self.outputs = outputs
        self.completed_task_ids = completed_task_ids


class CrewOrchestrator:
    """Orchestrates a Crew (agents + tasks + tools)."""

    def __init__(self, context: CrewContext, message_bus: MessageBus | None = None) -> None:
        self._context = context
        self._message_bus = message_bus

    async def run(self, options: CrewRunOptions | None = None) -> CrewRunResult:
        opts = options or CrewRunOptions()
        outputs: dict[str, Any] = dict(opts.initial_input)
        completed_task_ids: list[str] = []
        crew = self._context.crew
        agents = self._context.agents
        tasks = self._context.tasks
        order = crew.task_ids

        for task_id in order:
            task = tasks.get(task_id)
            if not task:
                continue
            agent_id = task.agent_id or (crew.agent_ids[0] if crew.agent_ids else "")
            agent = agents.get(agent_id) if agent_id else None
            if not agent:
                continue

            if self._message_bus:
                await self._message_bus.publish(
                    f"crew:{crew.id}",
                    agent_id,
                    {"type": "task_start", "task_id": task_id, "task_description": task.description},
                )

            result = await self._execute_task(task, agent.id, outputs)
            outputs[task_id] = result
            completed_task_ids.append(task_id)

            if self._message_bus:
                await self._message_bus.publish(
                    f"crew:{crew.id}",
                    agent_id,
                    {"type": "task_done", "task_id": task_id, "result": result},
                )

        return CrewRunResult(outputs=outputs, completed_task_ids=completed_task_ids)

    async def _execute_task(
        self,
        task: Any,
        agent_id: str,
        context: dict[str, Any],
    ) -> Any:
        if getattr(task, "output", None) is not None:
            return task.output
        return {"input": getattr(task, "input", None), "context": context, "agent_id": agent_id}
