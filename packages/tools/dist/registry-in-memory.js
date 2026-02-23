/**
 * In-memory tool registry with validation and async execution.
 */
export class InMemoryToolRegistry {
    tools = new Map();
    register(tool) {
        this.tools.set(tool.name, tool);
    }
    get(name) {
        return this.tools.get(name);
    }
    list() {
        return Array.from(this.tools.values());
    }
    async execute(name, input) {
        const tool = this.tools.get(name);
        if (!tool) {
            return { success: false, error: `Tool not found: ${name}` };
        }
        try {
            if (tool.inputSchema) {
                const parsed = tool.inputSchema.parse(input);
                const result = await tool.execute(parsed);
                return { success: true, data: result };
            }
            const result = await tool.execute(input);
            return { success: true, data: result };
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            return { success: false, error: message };
        }
    }
}
//# sourceMappingURL=registry-in-memory.js.map