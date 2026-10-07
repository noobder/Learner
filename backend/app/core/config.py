from dotenv import load_dotenv
import os

load_dotenv()


class Settings:
    APP_NAME = "AI Learner"

    CHROMA_DB = "./data/chroma"

    TRANSCRIPT_FOLDER = "./data/transcripts"

    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./data/learner.db")

    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-me")
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

    OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5:3b")
    OLLAMA_HOST = os.getenv("OLLAMA_HOST") or None
    OLLAMA_EMBED_MODEL = os.getenv("OLLAMA_EMBED_MODEL") or OLLAMA_MODEL

    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")


settings = Settings()
