export interface ExecutorOptions {
    /** Timeout in ms; default 5000 */
    timeoutMs?: number;
    /** Max memory (MB); not enforced on all platforms */
    maxMemoryMb?: number;
    /** Temp dir for code execution; default os.tmpdir()/agent-framework-* */
    tempDir?: string;
    /** Enable network (DANGEROUS); default false */
    allowNetwork?: boolean;
}
export interface ExecuteResult {
    success: boolean;
    stdout: string;
    stderr: string;
    exitCode: number | null;
    durationMs: number;
    error?: string;
}
/**
 * Execute Python code in a sandboxed subprocess.
 * OFF by default - must be explicitly enabled via tool registration.
 */
export declare function executePython(code: string, options?: ExecutorOptions): Promise<ExecuteResult>;
//# sourceMappingURL=sandbox.d.ts.map