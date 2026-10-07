$root = $PSScriptRoot

Start-Process powershell -ArgumentList @(
    "-NoExit", "-Command",
    "cd `"$root\backend`"; & `"$root\venv\Scripts\python.exe`" -m uvicorn app.main:app --reload --port 8001"
)

Start-Process powershell -ArgumentList @(
    "-NoExit", "-Command",
    "cd `"$root\frontend`"; npm run dev"
)

Write-Host "Backend starting on  http://127.0.0.1:8001"
Write-Host "Frontend starting on http://localhost:5173"
Write-Host "(Make sure 'ollama serve' is running with qwen2.5:3b pulled.)"
