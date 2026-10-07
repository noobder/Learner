from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import desc
from sqlalchemy.orm import Session as DBSession

from app.core.ai import delete_chunks, ingest_transcript
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.video import Video
from app.routers.sessions import get_owned_session
from app.schemas.video import IngestRequest, VideoOut
from app.services.youtube import extract_video_id, fetch_title, fetch_transcript

router = APIRouter(prefix="/sessions/{session_id}/videos", tags=["videos"])


@router.post("", response_model=VideoOut)
def ingest_video(
    session_id: int,
    payload: IngestRequest,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = get_owned_session(session_id, db, current_user)
    video_id = extract_video_id(payload.url)

    existing = next((v for v in session.videos if v.video_id == video_id), None)
    if existing:
        raise HTTPException(status_code=400, detail="This video is already in the session")

    title = fetch_title(payload.url, video_id)
    transcript_text = fetch_transcript(video_id)

    chunk_ids = ingest_transcript(
        session_id=session.id,
        video_id=video_id,
        title=title,
        text=transcript_text,
        user_id=current_user.id,
    )

    video = Video(
        video_id=video_id,
        url=payload.url,
        title=title,
        chunk_count=len(chunk_ids),
        chunk_ids=",".join(chunk_ids),
        session_id=session.id,
    )
    db.add(video)
    db.commit()
    db.refresh(video)
    return video


@router.get("", response_model=list[VideoOut])
def list_videos(
    session_id: int,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    get_owned_session(session_id, db, current_user)
    return (
        db.query(Video)
        .filter(Video.session_id == session_id)
        .order_by(desc(Video.created_at))
        .all()
    )


@router.delete("/{video_pk}")
def delete_video(
    session_id: int,
    video_pk: int,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    get_owned_session(session_id, db, current_user)
    video = (
        db.query(Video)
        .filter(Video.id == video_pk, Video.session_id == session_id)
        .first()
    )
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    if video.chunk_ids:
        delete_chunks(video.chunk_ids.split(","))

    db.delete(video)
    db.commit()
    return {"ok": True}
