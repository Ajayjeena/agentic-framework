/**
 * Agent runtime: executes a graph-based state machine with checkpointing.
 */
export class AgentRuntime {
    graph;
    checkpointer;
    constructor(graph, checkpointer) {
        this.graph = graph;
        this.checkpointer = checkpointer;
    }
    /**
     * Run the graph from entry (or from last checkpoint if threadId has state).
     */
    async run(options) {
        const { threadId, initialState = {}, maxSteps = 100 } = options;
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
            const result = await node.execute(state);
            state = result.state;
            await this.checkpointer.put({
                threadId,
                nodeId: currentNodeId,
                state,
                timestamp: Date.now() / 1000,
                version: steps,
            });
            steps++;
            if (result.next !== undefined) {
                currentNodeId = result.next;
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
    /**
     * Resume from checkpoint (convenience; run() already does this).
     */
    async resume(threadId, maxSteps = 100) {
        return this.run({ threadId, maxSteps });
    }
}
//# sourceMappingURL=runtime.js.map