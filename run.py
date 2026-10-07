"""Run the AI Learner backend and frontend together with a single command:

    venv\\Scripts\\python run.py

Starts the FastAPI backend (port 8001) and the Vite frontend dev server (port 5173)
as subprocesses, streams both logs to this terminal, and shuts both down cleanly
on Ctrl+C.
"""

import os
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent
BACKEND_DIR = ROOT / "backend"
FRONTEND_DIR = ROOT / "frontend"
BACKEND_PORT = "8001"

IS_WINDOWS = os.name == "nt"


def kill_process_tree(proc: subprocess.Popen) -> None:
    if proc.poll() is not None:
        return
    if IS_WINDOWS:
        subprocess.run(
            ["taskkill", "/F", "/T", "/PID", str(proc.pid)],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
    else:
        proc.terminate()


def main() -> None:
    print(f"Backend starting on  http://127.0.0.1:{BACKEND_PORT}")
    backend = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "app.main:app", "--reload", "--port", BACKEND_PORT],
        cwd=BACKEND_DIR,
    )

    print("Frontend starting on http://localhost:5173")
    npm = "npm.cmd" if IS_WINDOWS else "npm"
    frontend = subprocess.Popen([npm, "run", "dev"], cwd=FRONTEND_DIR)

    print("(Make sure 'ollama serve' is running with the configured model pulled.)")
    print("Press Ctrl+C to stop both.\n")

    try:
        while True:
            time.sleep(1)
            if backend.poll() is not None:
                print("Backend process exited unexpectedly.")
                break
            if frontend.poll() is not None:
                print("Frontend process exited unexpectedly.")
                break
    except KeyboardInterrupt:
        print("\nStopping...")
    finally:
        kill_process_tree(backend)
        kill_process_tree(frontend)


if __name__ == "__main__":
    main()
