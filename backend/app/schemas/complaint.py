from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID
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


class ComplaintBase(BaseModel):
    title: str
    description: str
    priority: ComplaintPriority = ComplaintPriority.medium
    category: ComplaintCategory = ComplaintCategory.other
    customer_id: Optional[UUID] = None
    product_id: Optional[UUID] = None
    assigned_to: Optional[UUID] = None
    lot_number: Optional[str] = None
    quantity_affected: Optional[int] = None
    due_date: Optional[datetime] = None
    is_draft: bool = False


class ComplaintCreate(ComplaintBase):
    pass


class ComplaintUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[ComplaintStatus] = None
    priority: Optional[ComplaintPriority] = None
    category: Optional[ComplaintCategory] = None
    customer_id: Optional[UUID] = None
    product_id: Optional[UUID] = None
    assigned_to: Optional[UUID] = None
    resolution_notes: Optional[str] = None
    lot_number: Optional[str] = None
    quantity_affected: Optional[int] = None
    due_date: Optional[datetime] = None
    resolved_at: Optional[datetime] = None


class ComplaintResponse(ComplaintBase):
    id: UUID
    ticket_number: str
    status: ComplaintStatus
    created_by: UUID
    resolution_notes: Optional[str] = None
    ai_summary: Optional[str] = None
    ai_suggested_action: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None
    ai_analysis_data: Optional[dict] = None

    class Config:
        from_attributes = True
