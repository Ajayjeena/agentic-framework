import type { MessageBus } from "./message-bus.js";
import type { AgentDefinition, CrewDefinition, CrewContext, Task } from "@agent-framework/core";

export interface CrewRunOptions {
  threadId?: string;
  initialInput?: Record<string, unknown>;
}

export interface CrewRunResult {
  outputs: Record<string, unknown>;
  completedTaskIds: string[];
}

/**
 * Crew orchestrator: runs a Crew (agents + tasks + tools) with optional message bus and delegation.
 */
export class CrewOrchestrator {
  constructor(
    private context: CrewContext,
    private messageBus?: MessageBus
  ) {}

  /**
   * Run crew in sequential order; tasks are executed by assigned agents.
   */
  async run(options: CrewRunOptions = {}): Promise<CrewRunResult> {
    const { threadId = "default", initialInput = {} } = options;
    const outputs: Record<string, unknown> = { ...initialInput };
    const completedTaskIds: string[] = [];
    const { crew, agents, tasks } = this.context;
    const order = crew.executionOrder === "sequential" ? crew.taskIds : [...crew.taskIds];

    for (const taskId of order) {
      const task = tasks.get(taskId);
      if (!task) continue;
      const agentId = task.agentId ?? crew.agentIds[0];
      const agent = agents.get(agentId);
      if (!agent) continue;

      if (this.messageBus) {
        await this.messageBus.publish({
          channel: `crew:${crew.id}`,
          senderId: agentId,
          payload: { type: "task_start", taskId, taskDescription: task.description },
        });
      }

      const result = await this.executeTask(task, agent, outputs);
      outputs[taskId] = result;
      completedTaskIds.push(taskId);

      if (this.messageBus) {
        await this.messageBus.publish({
          channel: `crew:${crew.id}`,
          senderId: agentId,
          payload: { type: "task_done", taskId, result },
        });
      }
    }

    return { outputs, completedTaskIds };
  }

  private async executeTask(
    task: Task,
    agent: AgentDefinition,
    context: Record<string, unknown>
  ): Promise<unknown> {
    if (task.output !== undefined) return task.output;
    return { input: task.input, context, agentId: agent.id };
  }
}
