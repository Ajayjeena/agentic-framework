import type { MessageBus } from "./message-bus.js";
import type { CrewContext } from "@agent-framework/core";
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
export declare class CrewOrchestrator {
    private context;
    private messageBus?;
    constructor(context: CrewContext, messageBus?: MessageBus | undefined);
    /**
     * Run crew in sequential order; tasks are executed by assigned agents.
     */
    run(options?: CrewRunOptions): Promise<CrewRunResult>;
    private executeTask;
}
//# sourceMappingURL=crew-orchestrator.d.ts.map