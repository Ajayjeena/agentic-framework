import type { MessageBus } from "./message-bus.js";
import type { CrewContext } from "@agent-framework/core";
import type { HumanInTheLoopOptions } from "@agent-framework/runtime";
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
export declare class CrewOrchestrator {
    private context;
    private messageBus?;
    private hitlOptions?;
    constructor(context: CrewContext, messageBus?: MessageBus | undefined, hitlOptions?: HumanInTheLoopOptions | undefined);
    private runCrewIntercept;
    /**
     * Run crew in sequential order; tasks are executed by assigned agents.
     */
    run(options?: CrewRunOptions): Promise<CrewRunResult>;
    private executeTask;
}
//# sourceMappingURL=crew-orchestrator.d.ts.map