import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Enum as SAEnum
from sqlalchemy import UUID
from sqlalchemy.orm import relationship
from app.database import Base
import enum


class ChatRole(str, enum.Enum):
    user = "user"
    assistant = "assistant"
    system = "system"


class ChatHistory(Base):
    __tablename__ = "chat_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    complaint_id = Column(UUID(as_uuid=True), ForeignKey("complaints.id", ondelete="CASCADE"), nullable=True, index=True)
    role = Column(SAEnum(ChatRole), nullable=False)
    message = Column(Text, nullable=False)
    tokens_used = Column(String(50), nullable=True)
    model_used = Column(String(100), nullable=True, default="gemma2-9b-it")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="chat_histories")
    complaint = relationship("Complaint", back_populates="chat_histories")

    def __repr__(self) -> str:
        return f"<ChatHistory {self.role}: {self.message[:50]}>"
