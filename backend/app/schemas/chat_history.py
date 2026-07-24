from pydantic import BaseModel
from datetime import datetime
from uuid import UUID
from typing import Optional
import enum


class ChatRole(str, enum.Enum):
    user = "user"
    assistant = "assistant"
    system = "system"


class ChatHistoryCreate(BaseModel):
    complaint_id: Optional[UUID] = None
    role: ChatRole
    message: str


class ChatHistoryResponse(BaseModel):
    id: UUID
    user_id: UUID
    complaint_id: Optional[UUID] = None
    role: ChatRole
    message: str
    tokens_used: Optional[str] = None
    model_used: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
