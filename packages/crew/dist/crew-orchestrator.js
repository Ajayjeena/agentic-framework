/**
 * Crew orchestrator: runs a Crew (agents + tasks + tools) with optional message bus and delegation.
 */
export class CrewOrchestrator {
    context;
    messageBus;
    constructor(context, messageBus) {
        this.context = context;
        this.messageBus = messageBus;
    }
    /**
     * Run crew in sequential order; tasks are executed by assigned agents.
     */
    async run(options = {}) {
        const { threadId = "default", initialInput = {} } = options;
        const outputs = { ...initialInput };
        const completedTaskIds = [];
        const { crew, agents, tasks } = this.context;
        const order = crew.executionOrder === "sequential" ? crew.taskIds : [...crew.taskIds];
        for (const taskId of order) {
            const task = tasks.get(taskId);
            if (!task)
                continue;
            const agentId = task.agentId ?? crew.agentIds[0];
            const agent = agents.get(agentId);
            if (!agent)
                continue;
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
    async executeTask(task, agent, context) {
        if (task.output !== undefined)
            return task.output;
        return { input: task.input, context, agentId: agent.id };
    }
}
//# sourceMappingURL=crew-orchestrator.js.map