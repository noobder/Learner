from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import desc
from sqlalchemy.orm import Session as DBSession

from app.core.ai import delete_chunks
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.session import Session
from app.models.user import User
from app.schemas.session import SessionCreate, SessionOut

router = APIRouter(prefix="/sessions", tags=["sessions"])


def _to_out(session: Session) -> SessionOut:
    return SessionOut(
        id=session.id,
        name=session.name,
        created_at=session.created_at,
        video_count=len(session.videos),
    )


def get_owned_session(session_id: int, db: DBSession, current_user: User) -> Session:
    session = (
        db.query(Session)
        .filter(Session.id == session_id, Session.owner_id == current_user.id)
        .first()
    )
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.post("", response_model=SessionOut)
def create_session(
    payload: SessionCreate,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = Session(name=payload.name or "Untitled session", owner_id=current_user.id)
    db.add(session)
    db.commit()
    db.refresh(session)
    return _to_out(session)


@router.get("", response_model=list[SessionOut])
def list_sessions(db: DBSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    sessions = (
        db.query(Session)
        .filter(Session.owner_id == current_user.id)
        .order_by(desc(Session.created_at))
        .all()
    )
    return [_to_out(s) for s in sessions]


@router.delete("/{session_id}")
def delete_session(
    session_id: int,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = get_owned_session(session_id, db, current_user)

    all_chunk_ids: list[str] = []
    for video in session.videos:
        if video.chunk_ids:
            all_chunk_ids.extend(video.chunk_ids.split(","))
    delete_chunks(all_chunk_ids)

    db.delete(session)
    db.commit()
    return {"ok": True}
