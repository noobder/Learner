from datetime import datetime

from pydantic import BaseModel, Field


class IngestRequest(BaseModel):
    url: str = Field(min_length=1)


class VideoOut(BaseModel):
    id: int
    video_id: str
    url: str
    title: str
    chunk_count: int
    created_at: datetime

    class Config:
        from_attributes = True


class AskRequest(BaseModel):
    question: str = Field(min_length=1)
    video_id: str | None = None


class AskResponse(BaseModel):
    answer: str
    sources: list[str]
