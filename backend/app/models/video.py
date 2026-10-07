from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class Video(Base):
    __tablename__ = "videos"

    id = Column(Integer, primary_key=True, index=True)
    video_id = Column(String, index=True, nullable=False)
    url = Column(String, nullable=False)
    title = Column(String, nullable=False)
    chunk_count = Column(Integer, default=0)
    chunk_ids = Column(Text, default="")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    session_id = Column(Integer, ForeignKey("sessions.id"), nullable=False)
    session = relationship("Session", back_populates="videos")
