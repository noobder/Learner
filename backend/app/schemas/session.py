from datetime import datetime

from pydantic import BaseModel, Field


class SessionCreate(BaseModel):
    name: str = Field(default="Untitled session", max_length=120)


class SessionOut(BaseModel):
    id: int
    name: str
    created_at: datetime
    video_count: int = 0

    class Config:
        from_attributes = True
