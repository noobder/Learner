from datetime import datetime

from pydantic import BaseModel


class ChatMessageOut(BaseModel):
    id: int
    role: str
    content: str
    sources: list[str]
    created_at: datetime

    class Config:
        from_attributes = True
