"""
Server-side code execution.

⚠️  DEV-ONLY. This runs user-submitted code in a subprocess with
limited time/output, but NO syscall sandbox. Never expose to the
public internet without a real sandbox (gVisor / Firecracker / Judge0).
"""

import asyncio
import os
import shutil
import subprocess
import tempfile
import time
from dataclasses import dataclass
from typing import Optional


SUPPORTED = {
    "python":     {"ext": "py",  "cmd": ["python", "{file}"]},
    "javascript": {"ext": "js",  "cmd": ["node", "{file}"]},
    "java":       {"ext": "java","build": ["javac", "{file}"], "cmd": ["java", "-cp", "{dir}", "Main"], "filename": "Main.java"},
    "cpp":        {"ext": "cpp", "build": ["g++", "-std=c++17", "-O2", "{file}", "-o", "{dir}/a.out"], "cmd": ["{dir}/a.out"]},
    "go":         {"ext": "go",  "cmd": ["go", "run", "{file}"]},
}

DEFAULT_TIMEOUT_SEC = 5
MAX_OUTPUT_BYTES = 32 * 1024


@dataclass
class RunResult:
    ok: bool
    stdout: str
    stderr: str
    exit_code: int
    runtime_ms: int
    timed_out: bool = False
    compile_error: Optional[str] = None


def _run_sync(cmd: list[str], cwd: str, stdin: Optional[str], timeout: int) -> tuple[str, str, int, bool]:
    """Blocking subprocess.run with timeout. Cross-platform (works on Windows)."""
    try:
        result = subprocess.run(
            cmd,
            cwd=cwd,
            input=(stdin or "") if stdin else None,
            capture_output=True,
            text=True,
            timeout=timeout,
            env={**os.environ, "PYTHONUNBUFFERED": "1"},
        )
        out = (result.stdout or "")[:MAX_OUTPUT_BYTES]
        err = (result.stderr or "")[:MAX_OUTPUT_BYTES]
        return out, err, result.returncode, False
    except subprocess.TimeoutExpired as e:
        out = (e.stdout.decode("utf-8", errors="replace") if isinstance(e.stdout, bytes) else (e.stdout or ""))[:MAX_OUTPUT_BYTES]
        err = (e.stderr.decode("utf-8", errors="replace") if isinstance(e.stderr, bytes) else (e.stderr or ""))[:MAX_OUTPUT_BYTES]
        return out, err + f"\n[Timed out after {timeout}s]", -1, True
    except FileNotFoundError as e:
        return "", f"Compiler not installed: {e}", -1, False


async def _run(cmd: list[str], cwd: str, stdin: Optional[str], timeout: int) -> tuple[str, str, int, bool]:
    """Async wrapper — runs the blocking subprocess in a thread executor."""
    return await asyncio.get_event_loop().run_in_executor(
        None, _run_sync, cmd, cwd, stdin, timeout,
    )


async def execute(language: str, code: str, stdin: Optional[str] = None, timeout: int = DEFAULT_TIMEOUT_SEC) -> RunResult:
    """Execute code in a temp dir; clean up after."""
    language = language.lower()
    if language not in SUPPORTED:
        return RunResult(False, "", f"Unsupported language: {language}", -1, 0)

    spec = SUPPORTED[language]
    tmp = tempfile.mkdtemp(prefix="trk_run_")
    try:
        filename = spec.get("filename") or f"main.{spec['ext']}"
        path = os.path.join(tmp, filename)
        with open(path, "w", encoding="utf-8") as f:
            f.write(code)

        # Compile step if any
        if "build" in spec:
            build_cmd = [a.format(file=path, dir=tmp) for a in spec["build"]]
            _, build_err, build_rc, build_to = await _run(build_cmd, tmp, None, timeout)
            if build_to or build_rc != 0:
                return RunResult(False, "", build_err, build_rc, 0, build_to, compile_error=build_err)

        # Run step
        run_cmd = [a.format(file=path, dir=tmp) for a in spec["cmd"]]
        t0 = time.perf_counter()
        out, err, rc, timed_out = await _run(run_cmd, tmp, stdin, min(timeout, DEFAULT_TIMEOUT_SEC * 2))
        elapsed_ms = int((time.perf_counter() - t0) * 1000)

        return RunResult(
            ok=rc == 0 and not timed_out,
            stdout=out, stderr=err, exit_code=rc, runtime_ms=elapsed_ms, timed_out=timed_out,
        )
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def available_languages() -> list[dict]:
    """Probe which compilers are actually on PATH."""
    import shutil as sh
    avail = []
    probes = {
        "python": "python",
        "javascript": "node",
        "java": "javac",
        "cpp": "g++",
        "go": "go",
    }
    for lang, exe in probes.items():
        avail.append({"language": lang, "available": sh.which(exe) is not None})
    return avail
