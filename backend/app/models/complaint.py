import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, Enum as SAEnum, Integer, Boolean, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base
import enum


class ComplaintStatus(str, enum.Enum):
    open = "open"
    in_progress = "in_progress"
    under_review = "under_review"
    resolved = "resolved"
    closed = "closed"
    rejected = "rejected"


class ComplaintPriority(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class ComplaintCategory(str, enum.Enum):
    product_quality = "product_quality"
    packaging = "packaging"
    labeling = "labeling"
    adverse_reaction = "adverse_reaction"
    contamination = "contamination"
    efficacy = "efficacy"
    delivery = "delivery"
    other = "other"


class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    ticket_number = Column(String(20), unique=True, nullable=False, index=True)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(SAEnum(ComplaintStatus), default=ComplaintStatus.open, nullable=False, index=True)
    priority = Column(SAEnum(ComplaintPriority), default=ComplaintPriority.medium, nullable=False, index=True)
    category = Column(SAEnum(ComplaintCategory), default=ComplaintCategory.other, nullable=False, index=True)
    resolution_notes = Column(Text, nullable=True)
    ai_summary = Column(Text, nullable=True)
    ai_suggested_action = Column(Text, nullable=True)
    lot_number = Column(String(100), nullable=True)
    quantity_affected = Column(Integer, nullable=True)
    ai_analysis_data = Column(JSON, nullable=True)

    # Foreign Keys
    customer_id = Column(UUID(as_uuid=True), ForeignKey("customers.id"), nullable=True, index=True)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=True, index=True)
    assigned_to = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True, index=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    resolved_at = Column(DateTime, nullable=True)
    due_date = Column(DateTime, nullable=True)
    is_draft = Column(Boolean, default=False, nullable=False)

    # Relationships
    customer = relationship("Customer", back_populates="complaints")
    product = relationship("Product", back_populates="complaints")
    assignee = relationship("User", foreign_keys=[assigned_to], back_populates="complaints_assigned")
    creator = relationship("User", foreign_keys=[created_by], back_populates="complaints_created")
    uploaded_files = relationship("UploadedFile", back_populates="complaint", cascade="all, delete-orphan")
    chat_histories = relationship("ChatHistory", back_populates="complaint", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Complaint {self.ticket_number}: {self.title[:50]}>"
