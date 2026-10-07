from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    role = Column(String, nullable=False)  # "user" or "assistant"
    content = Column(Text, nullable=False)
    sources = Column(Text, default="")  # comma-separated video titles, assistant messages only
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    session_id = Column(Integer, ForeignKey("sessions.id"), nullable=False)
    session = relationship("Session", back_populates="messages")
