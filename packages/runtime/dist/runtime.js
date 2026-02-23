/**
 * Agent runtime: executes a graph-based state machine with checkpointing and optional HITL.
 */
export class AgentRuntime {
    graph;
    checkpointer;
    hitlOptions;
    constructor(graph, checkpointer, hitlOptions) {
        this.graph = graph;
        this.checkpointer = checkpointer;
        this.hitlOptions = hitlOptions;
    }
    async runIntercept(options, hitl) {
        const { handler, webhookUrl, timeoutMs = 30_000 } = hitl;
        const context = {
            threadId: options.threadId,
            nodeId: options.nodeId,
            step: options.step,
            state: options.state,
            proposedAction: options.proposedAction,
            proposedOutput: options.proposedOutput,
            timestamp: Date.now() / 1000,
        };
        const runWithTimeout = async () => {
            if (webhookUrl) {
                const controller = new AbortController();
                const id = setTimeout(() => controller.abort(), timeoutMs);
                const res = await fetch(webhookUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(context),
                    signal: controller.signal,
                });
                clearTimeout(id);
                const body = (await res.json());
                return { decision: body.decision, modifiedState: body.modifiedState };
            }
            if (handler) {
                const response = await Promise.race([
                    Promise.resolve(handler(context)),
                    new Promise((_, reject) => setTimeout(() => reject(new Error("HITL timeout")), timeoutMs)),
                ]);
                return { decision: response.decision, modifiedState: response.modifiedState };
            }
            return { decision: "approve" };
        };
        try {
            return await runWithTimeout();
        }
        catch {
            return { decision: "skip" };
        }
    }
    /**
     * Run the graph from entry (or from last checkpoint if threadId has state).
     */
    async run(options) {
        const { threadId, initialState = {}, maxSteps = 100, hitl: hitlOverride } = options;
        const hitl = hitlOverride ?? this.hitlOptions;
        const interceptAlways = hitl?.mode === "ALWAYS";
        const interceptTerminate = hitl?.mode === "TERMINATE";
        let state = { ...initialState };
        let currentNodeId = this.graph.entry;
        let steps = 0;
        const last = await this.checkpointer.get(threadId);
        if (last) {
            currentNodeId = last.nodeId;
            state = { ...last.state };
        }
        const endNodes = this.graph.endNodes ?? new Set();
        const nodes = this.graph.nodes;
        while (steps < maxSteps) {
            const node = nodes.get(currentNodeId);
            if (!node)
                break;
            if (interceptAlways && hitl) {
                const { decision, modifiedState } = await this.runIntercept({ threadId, nodeId: currentNodeId, step: steps, state }, hitl);
                if (decision === "terminate") {
                    return {
                        state,
                        currentNodeId,
                        steps,
                        ended: false,
                        terminatedByHuman: true,
                    };
                }
                if (decision === "modify" && modifiedState) {
                    state = modifiedState;
                }
            }
            const result = await node.execute(state);
            state = result.state;
            const nextNodeId = result.next;
            const wouldEnd = nextNodeId !== undefined && endNodes.has(nextNodeId);
            if (wouldEnd && interceptTerminate && hitl) {
                const { decision, modifiedState } = await this.runIntercept({
                    threadId,
                    nodeId: currentNodeId,
                    step: steps,
                    state,
                    proposedAction: "complete",
                    proposedOutput: state,
                }, hitl);
                if (decision === "terminate") {
                    return {
                        state,
                        currentNodeId,
                        steps,
                        ended: false,
                        terminatedByHuman: true,
                    };
                }
                if (decision === "modify" && modifiedState) {
                    state = modifiedState;
                }
            }
            await this.checkpointer.put({
                threadId,
                nodeId: currentNodeId,
                state,
                timestamp: Date.now() / 1000,
                version: steps,
            });
            steps++;
            if (nextNodeId !== undefined) {
                currentNodeId = nextNodeId;
            }
            else {
                break;
            }
            if (endNodes.has(currentNodeId)) {
                return {
                    state,
                    currentNodeId,
                    steps,
                    ended: true,
                };
            }
        }
        return {
            state,
            currentNodeId,
            steps,
            ended: endNodes.has(currentNodeId),
        };
    }
    async resume(threadId, maxSteps = 100) {
        return this.run({ threadId, maxSteps });
    }
}
//# sourceMappingURL=runtime.js.map