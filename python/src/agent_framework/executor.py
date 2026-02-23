"""Sandboxed code executor (UserProxy-style). OFF by default."""

import asyncio
import os
import subprocess
import tempfile
import uuid
from dataclasses import dataclass
from typing import Any


@dataclass
class ExecuteResult:
    """Result of code execution."""

    success: bool
    stdout: str
    stderr: str
    exit_code: int | None
    duration_ms: float
    error: str | None = None


async def execute_python(
    code: str,
    timeout_ms: int = 5000,
    temp_dir: str | None = None,
) -> ExecuteResult:
    """Execute Python code in a sandboxed subprocess."""
    if not code or not isinstance(code, str):
        return ExecuteResult(
            success=False,
            stdout="",
            stderr="Invalid code",
            exit_code=-1,
            duration_ms=0,
            error="Invalid input",
        )

    start = __import__("time").time()
    td = temp_dir or os.path.join(tempfile.gettempdir(), f"agent-framework-{uuid.uuid4()}")

    try:
        os.makedirs(td, exist_ok=True)
        script_path = os.path.join(td, "script.py")
        with open(script_path, "w", encoding="utf-8") as f:
            f.write(code)

        proc = await asyncio.create_subprocess_exec(
            "python3", "-u", script_path,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            cwd=td,
            env={**os.environ, "PYTHONIOENCODING": "utf-8"},
        )

        try:
            stdout, stderr = await asyncio.wait_for(
                proc.communicate(),
                timeout=timeout_ms / 1000,
            )
        except asyncio.TimeoutError:
            proc.kill()
            await proc.wait()
            return ExecuteResult(
                success=False,
                stdout="",
                stderr="Execution timeout",
                exit_code=None,
                duration_ms=(__import__("time").time() - start) * 1000,
                error="Timeout",
            )

        duration_ms = (__import__("time").time() - start) * 1000
        try:
            import shutil
            shutil.rmtree(td, ignore_errors=True)
        except Exception:
            pass

        return ExecuteResult(
            success=proc.returncode == 0,
            stdout=stdout.decode("utf-8", errors="replace"),
            stderr=stderr.decode("utf-8", errors="replace"),
            exit_code=proc.returncode,
            duration_ms=duration_ms,
        )
    except Exception as e:
        return ExecuteResult(
            success=False,
            stdout="",
            stderr=str(e),
            exit_code=-1,
            duration_ms=(__import__("time").time() - start) * 1000,
            error=str(e),
        )


class UserProxy:
    """UserProxy: executes code (sandboxed, off by default) and tools."""

    def __init__(
        self,
        code_execution_enabled: bool = False,
        executor_timeout_ms: int = 5000,
        tool_executor: Any = None,
    ):
        self._code_execution_enabled = code_execution_enabled
        self._executor_timeout_ms = executor_timeout_ms
        self._tool_executor = tool_executor

    async def execute_code(self, code: str) -> dict[str, Any]:
        """Execute Python code. Only works when code execution is enabled."""
        if not self._code_execution_enabled:
            return {"success": False, "output": "", "error": "Code execution is disabled for security"}
        result = await execute_python(code, timeout_ms=self._executor_timeout_ms)
        return {
            "success": result.success,
            "output": result.stdout,
            "error": result.error or (result.stderr if not result.success else None),
        }

    async def execute_tool(self, name: str, input_data: Any) -> Any:
        """Execute a tool by name."""
        if not self._tool_executor:
            return {"success": False, "error": "Tool executor not configured"}
        return await self._tool_executor(name, input_data)

    def is_code_execution_enabled(self) -> bool:
        return self._code_execution_enabled
