import { executePython } from "./sandbox.js";
/**
 * UserProxy: can execute code (sandboxed) and tools on behalf of the user.
 * Returns results for agent feedback.
 */
export class UserProxy {
    options;
    constructor(options = {}) {
        this.options = options;
    }
    /**
     * Execute Python code. Only works when codeExecutionEnabled is true.
     */
    async executeCode(code) {
        if (!this.options.codeExecutionEnabled) {
            return {
                success: false,
                output: "",
                error: "Code execution is disabled for security",
            };
        }
        const result = await executePython(code, {
            timeoutMs: this.options.executorTimeoutMs ?? 5000,
        });
        return {
            success: result.success,
            output: result.stdout,
            error: result.error ?? (result.stderr || undefined),
        };
    }
    /**
     * Execute a tool by name.
     */
    async executeTool(name, input) {
        if (!this.options.toolExecutor) {
            return { success: false, error: `Tool executor not configured` };
        }
        return this.options.toolExecutor(name, input);
    }
    /**
     * Check if code execution is enabled.
     */
    isCodeExecutionEnabled() {
        return this.options.codeExecutionEnabled === true;
    }
}
//# sourceMappingURL=proxy.js.map