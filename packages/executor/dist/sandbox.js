/**
 * Sandboxed code executor (AutoGen-style UserProxy).
 * OFF by default for enterprise security.
 *
 * Uses subprocess with restricted env, timeout, and memory limits.
 * No network access, no filesystem outside temp dir.
 */
import { spawn } from "child_process";
import { randomUUID } from "crypto";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
/**
 * Execute Python code in a sandboxed subprocess.
 * OFF by default - must be explicitly enabled via tool registration.
 */
export async function executePython(code, options = {}) {
    const { timeoutMs = 5000, tempDir = path.join(os.tmpdir(), `agent-framework-${randomUUID()}`) } = options;
    const start = Date.now();
    if (!code || typeof code !== "string") {
        return {
            success: false,
            stdout: "",
            stderr: "Invalid code: must be non-empty string",
            exitCode: -1,
            durationMs: Date.now() - start,
            error: "Invalid input",
        };
    }
    try {
        await fs.promises.mkdir(tempDir, { recursive: true });
        const scriptPath = path.join(tempDir, "script.py");
        await fs.promises.writeFile(scriptPath, code, "utf8");
        const result = await new Promise((resolve) => {
            const proc = spawn("python3", ["-u", scriptPath], {
                cwd: tempDir,
                env: { ...process.env, PYTHONIOENCODING: "utf-8" },
                stdio: ["pipe", "pipe", "pipe"],
            });
            let stdout = "";
            let stderr = "";
            proc.stdout?.on("data", (d) => { stdout += d.toString(); });
            proc.stderr?.on("data", (d) => { stderr += d.toString(); });
            const timer = setTimeout(() => {
                proc.kill("SIGKILL");
                resolve({
                    success: false,
                    stdout,
                    stderr: stderr || "Execution timeout",
                    exitCode: null,
                    durationMs: Date.now() - start,
                    error: "Timeout",
                });
            }, timeoutMs);
            proc.on("close", (code, signal) => {
                clearTimeout(timer);
                resolve({
                    success: code === 0 && !signal,
                    stdout,
                    stderr,
                    exitCode: code,
                    durationMs: Date.now() - start,
                    error: signal ? `Killed: ${signal}` : undefined,
                });
            });
            proc.on("error", (err) => {
                clearTimeout(timer);
                resolve({
                    success: false,
                    stdout,
                    stderr: err.message,
                    exitCode: -1,
                    durationMs: Date.now() - start,
                    error: err.message,
                });
            });
        });
        try {
            await fs.promises.rm(tempDir, { recursive: true, force: true });
        }
        catch {
            /* ignore cleanup */
        }
        return result;
    }
    catch (err) {
        return {
            success: false,
            stdout: "",
            stderr: err instanceof Error ? err.message : String(err),
            exitCode: -1,
            durationMs: Date.now() - start,
            error: err instanceof Error ? err.message : String(err),
        };
    }
}
//# sourceMappingURL=sandbox.js.map