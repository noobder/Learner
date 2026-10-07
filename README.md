# AI Learner

Study from YouTube videos with an AI tutor that runs locally. Paste video links into a study session, then chat with the transcripts. Answers are grounded in what the videos actually say.

## Features

- User registration and login (JWT authentication)
- **Sessions**: each study session is an isolated knowledge base of YouTube videos
- Automatic transcript fetching, chunking, and embedding into ChromaDB
- RAG chat: retrieves relevant transcript excerpts and answers with a local LLM (Ollama)
- Writes example code when asked, and says so honestly when the videos don't cover a question
- Markdown-rendered chat responses

## Tech Stack

| Layer    | Technology                                                        |
| -------- | ----------------------------------------------------------------- |
| Backend  | FastAPI, SQLAlchemy (SQLite), ChromaDB, LangChain / LangGraph      |
| AI       | Ollama (default model `qwen2.5:3b`) for chat and embeddings        |
| Frontend | React, Vite, Tailwind CSS                                         |

## Project Structure

```
learner/
├── backend/
│   └── app/
│       ├── core/       # config, auth/security, AI + vector store
│       ├── models/     # SQLAlchemy models
│       ├── routers/    # auth, sessions, videos, chat endpoints
│       ├── schemas/    # Pydantic schemas
│       └── services/   # YouTube transcript/title fetching
├── frontend/           # React + Vite app
├── run.py              # starts backend and frontend together
└── requirements.txt
```

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- [Ollama](https://ollama.com) installed, with the model pulled:
  ```bash
  ollama pull qwen2.5:3b
  ```

### Setup

```bash
# Backend
python -m venv venv
venv\Scripts\activate          # Windows (use `source venv/bin/activate` on macOS/Linux)
pip install -r requirements.txt
cp backend/.env.example backend/.env

# Frontend
cd frontend
npm install
cp .env.example .env
cd ..
```

### Run

Make sure `ollama serve` is running, then:

```bash
python run.py
```

On Windows you can also run `start.ps1`.

- Frontend: http://localhost:5173
- Backend API: http://127.0.0.1:8001 (docs at `/docs`)

## Configuration

Set these in `backend/.env`:

| Variable       | Default                 | Description                        |
| -------------- | ----------------------- | ---------------------------------- |
| `SECRET_KEY`   | `dev-secret-change-me`  | JWT signing key (change this)      |
| `OLLAMA_MODEL` | `qwen2.5:3b`            | Ollama model used for chat         |
| `OLLAMA_EMBED_MODEL` | same as `OLLAMA_MODEL` | Ollama model used for embeddings (e.g. `nomic-embed-text`) |
| `OLLAMA_HOST`  | local default           | Ollama server URL                  |
| `CORS_ORIGINS` | `http://localhost:5173` | Allowed frontend origins           |
