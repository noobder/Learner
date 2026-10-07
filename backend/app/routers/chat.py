import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session as DBSession

from app.core.ai import ask, build_history_messages
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.chat_message import ChatMessage
from app.models.user import User
from app.routers.sessions import get_owned_session
from app.schemas.chat import ChatMessageOut
from app.schemas.video import AskRequest, AskResponse

router = APIRouter(prefix="/sessions/{session_id}/chat", tags=["chat"])


def _to_out(message: ChatMessage) -> ChatMessageOut:
    return ChatMessageOut(
        id=message.id,
        role=message.role,
        content=message.content,
        sources=json.loads(message.sources) if message.sources else [],
        created_at=message.created_at,
    )


@router.get("/messages", response_model=list[ChatMessageOut])
def list_messages(
    session_id: int,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = get_owned_session(session_id, db, current_user)
    return [_to_out(m) for m in session.messages]


@router.post("/ask", response_model=AskResponse)
def ask_question(
    session_id: int,
    payload: AskRequest,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = get_owned_session(session_id, db, current_user)
    video_titles = [v.title for v in session.videos]

    scoped_title = None
    if payload.video_id:
        owns_video = next((v for v in session.videos if v.video_id == payload.video_id), None)
        if not owns_video:
            raise HTTPException(status_code=404, detail="Video not found in this session")
        scoped_title = owns_video.title

    prior_turns = (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.id)
        .all()
    )
    turn_pairs: list[tuple[str, str]] = []
    pending_question = None
    for msg in prior_turns:
        if msg.role == "user":
            pending_question = msg.content
        elif msg.role == "assistant" and pending_question is not None:
            turn_pairs.append((pending_question, msg.content))
            pending_question = None

    try:
        result = ask(
            question=payload.question,
            user_id=current_user.id,
            session_id=session_id,
            video_id=payload.video_id,
            history=build_history_messages(turn_pairs),
            video_titles=video_titles,
            scoped_title=scoped_title,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=(
                "The AI model could not be reached. Make sure Ollama is running locally "
                f"and the model is pulled. ({exc})"
            ),
        ) from exc

    db.add(ChatMessage(session_id=session_id, role="user", content=payload.question))
    db.add(
        ChatMessage(
            session_id=session_id,
            role="assistant",
            content=result["answer"],
            sources=json.dumps(result["sources"]),
        )
    )
    db.commit()

    return AskResponse(**result)
