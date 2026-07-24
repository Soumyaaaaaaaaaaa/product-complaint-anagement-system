from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.chat_history import ChatHistory
from app.schemas.chat_history import ChatHistoryCreate, ChatRole


def create_chat_message(
    db: Session,
    user_id: str,
    chat_in: ChatHistoryCreate,
    tokens_used: Optional[str] = None,
    model_used: Optional[str] = "gemma2-9b-it",
) -> ChatHistory:
    db_msg = ChatHistory(
        user_id=user_id,
        complaint_id=chat_in.complaint_id,
        role=chat_in.role,
        message=chat_in.message,
        tokens_used=tokens_used,
        model_used=model_used,
    )
    db.add(db_msg)
    db.commit()
    db.refresh(db_msg)
    return db_msg


def get_chat_history(
    db: Session,
    user_id: str,
    complaint_id: Optional[str] = None,
    limit: int = 50,
) -> List[ChatHistory]:
    query = db.query(ChatHistory).filter(ChatHistory.user_id == user_id)
    if complaint_id:
        query = query.filter(ChatHistory.complaint_id == complaint_id)
    return query.order_by(ChatHistory.created_at.asc()).limit(limit).all()


def delete_chat_history(db: Session, user_id: str, complaint_id: Optional[str] = None) -> None:
    query = db.query(ChatHistory).filter(ChatHistory.user_id == user_id)
    if complaint_id:
        query = query.filter(ChatHistory.complaint_id == complaint_id)
    query.delete()
    db.commit()
