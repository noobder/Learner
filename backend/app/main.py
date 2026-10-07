from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import Base, engine
from app.models import chat_message, user, session, video  # noqa: F401 ensure models are registered
from app.routers import auth, chat, sessions, videos

app = FastAPI(
    title="AI Learner",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)


app.include_router(auth.router)
app.include_router(sessions.router)
app.include_router(videos.router)
app.include_router(chat.router)


@app.get("/")
def home():
    return {
        "message": "Welcome to AI Learner"
    }


@app.get("/health")
def health():
    return {
        "status": "running"
    }
