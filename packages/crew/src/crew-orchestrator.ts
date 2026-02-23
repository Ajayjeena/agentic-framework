import type { MessageBus } from "./message-bus.js";
import type { AgentDefinition, CrewDefinition, CrewContext, Task } from "@agent-framework/core";
import type { HumanInTheLoopOptions, InterceptHandler } from "@agent-framework/runtime";

export interface CrewRunOptions {
  threadId?: string;
  initialInput?: Record<string, unknown>;
  /** Override HITL for this run */
  hitl?: HumanInTheLoopOptions | null;
}

export interface CrewRunResult {
  outputs: Record<string, unknown>;
  completedTaskIds: string[];
  /** True if terminated by HITL */
  terminatedByHuman?: boolean;
}

/**
 * Crew orchestrator: runs a Crew (agents + tasks + tools) with optional message bus, delegation, and HITL.
 */
export class CrewOrchestrator {
  constructor(
    private context: CrewContext,
    private messageBus?: MessageBus,
    private hitlOptions?: HumanInTheLoopOptions
  ) {}

  private async runCrewIntercept(
    context: { threadId: string; taskId: string; taskDescription: string; outputs: Record<string, unknown>; step: number },
    hitl: HumanInTheLoopOptions
  ): Promise<{ decision: "approve" | "skip" | "terminate" | "modify"; modifiedOutputs?: Record<string, unknown> }> {
    const { handler, webhookUrl, timeoutMs = 30_000 } = hitl;
    const ctx = {
      threadId: context.threadId,
      nodeId: context.taskId,
      step: context.step,
      state: context.outputs,
      proposedAction: `task:${context.taskId}`,
      proposedOutput: undefined,
      timestamp: Date.now() / 1000,
    };
    if (webhookUrl) {
      try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeoutMs);
        const res = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(ctx),
          signal: controller.signal,
        });
        clearTimeout(id);
        const body = (await res.json()) as { decision: string; modifiedState?: Record<string, unknown> };
        return { decision: body.decision as "approve" | "skip" | "terminate" | "modify", modifiedOutputs: body.modifiedState };
      } catch {
        return { decision: "skip" };
      }
    }
    if (handler) {
      try {
        const resp = await Promise.race([
          Promise.resolve(handler(ctx)),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error("HITL timeout")), timeoutMs)),
        ]);
        return { decision: resp.decision, modifiedOutputs: resp.modifiedState };
      } catch {
        return { decision: "skip" };
      }
    }
    return { decision: "approve" };
  }

  /**
   * Run crew in sequential order; tasks are executed by assigned agents.
   */
  async run(options: CrewRunOptions = {}): Promise<CrewRunResult> {
    const { threadId = "default", initialInput = {}, hitl: hitlOverride } = options;
    const hitl = hitlOverride ?? this.hitlOptions;
    const interceptAlways = hitl?.mode === "ALWAYS";
    const outputs: Record<string, unknown> = { ...initialInput };
    const completedTaskIds: string[] = [];
    const { crew, agents, tasks } = this.context;
    const order = crew.executionOrder === "sequential" ? crew.taskIds : [...crew.taskIds];

    for (let step = 0; step < order.length; step++) {
      const taskId = order[step];
      const task = tasks.get(taskId);
      if (!task) continue;
      const agentId = task.agentId ?? crew.agentIds[0];
      const agent = agents.get(agentId);
      if (!agent) continue;

      if (interceptAlways && hitl) {
        const { decision, modifiedOutputs } = await this.runCrewIntercept(
          { threadId, taskId, taskDescription: task.description, outputs, step },
          hitl
        );
        if (decision === "terminate") {
          return { outputs, completedTaskIds, terminatedByHuman: true };
        }
        if (decision === "modify" && modifiedOutputs) {
          Object.assign(outputs, modifiedOutputs);
        }
      }

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
