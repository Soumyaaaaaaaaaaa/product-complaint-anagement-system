from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from app.database import get_db
from app.schemas.chat_history import ChatHistoryCreate, ChatHistoryResponse
from app.crud.chat_history import create_chat_message, get_chat_history, delete_chat_history
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.get("/history", response_model=List[ChatHistoryResponse])
def get_history(
    complaint_id: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_chat_history(db, user_id=str(current_user.id), complaint_id=complaint_id, limit=limit)


@router.post("/message", response_model=ChatHistoryResponse, status_code=201)
def send_message(
    message_in: ChatHistoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Store a chat message. AI integration (LangGraph + Groq) will be wired here in the next phase.
    Currently returns a scaffold response.
    """
    # Save the user message
    user_msg = create_chat_message(
        db=db,
        user_id=str(current_user.id),
        chat_in=message_in,
    )

    # Scaffold AI response - will be replaced by LangGraph agent
    assistant_response = ChatHistoryCreate(
        complaint_id=message_in.complaint_id,
        role="assistant",
        message="[AI Assistant will be available once Groq API is configured. This is a placeholder response.]",
    )
    create_chat_message(
        db=db,
        user_id=str(current_user.id),
        chat_in=assistant_response,
        model_used="gemma2-9b-it",
    )

    return user_msg


@router.delete("/history", status_code=204)
def clear_history(
    complaint_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    delete_chat_history(db, user_id=str(current_user.id), complaint_id=complaint_id)
