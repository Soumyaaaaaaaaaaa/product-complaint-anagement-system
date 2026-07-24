import random
import string
from datetime import datetime
from typing import Optional, List
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_
from app.models.complaint import Complaint
from app.schemas.complaint import ComplaintCreate, ComplaintUpdate


def generate_ticket_number() -> str:
    suffix = "".join(random.choices(string.digits, k=6))
    return f"PC-{datetime.utcnow().year}-{suffix}"


def get_complaint(db: Session, complaint_id: str) -> Optional[Complaint]:
    return (
        db.query(Complaint)
        .options(
            joinedload(Complaint.customer),
            joinedload(Complaint.product),
            joinedload(Complaint.creator),
            joinedload(Complaint.assignee),
        )
        .filter(Complaint.id == complaint_id)
        .first()
    )


def get_complaints(
    db: Session,
    skip: int = 0,
    limit: int = 50,
    search: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    category: Optional[str] = None,
    assigned_to: Optional[str] = None,
    created_by: Optional[str] = None,
    from_date: Optional[datetime] = None,
    to_date: Optional[datetime] = None,
) -> List[Complaint]:
    query = db.query(Complaint).options(
        joinedload(Complaint.customer),
        joinedload(Complaint.product),
        joinedload(Complaint.creator),
        joinedload(Complaint.assignee),
    )
    if search:
        query = query.filter(
            or_(
                Complaint.title.ilike(f"%{search}%"),
                Complaint.ticket_number.ilike(f"%{search}%"),
                Complaint.description.ilike(f"%{search}%"),
            )
        )
    if status:
        query = query.filter(Complaint.status == status)
    if priority:
        query = query.filter(Complaint.priority == priority)
    if category:
        query = query.filter(Complaint.category == category)
    if assigned_to:
        query = query.filter(Complaint.assigned_to == assigned_to)
    if created_by:
        query = query.filter(Complaint.created_by == created_by)
    if from_date:
        query = query.filter(Complaint.created_at >= from_date)
    if to_date:
        query = query.filter(Complaint.created_at <= to_date)
    return query.order_by(Complaint.created_at.desc()).offset(skip).limit(limit).all()

def count_complaints(db: Session, status: Optional[str] = None) -> int:
    query = db.query(Complaint)
    if status:
        query = query.filter(Complaint.status == status)
    return query.count()


def create_complaint(db: Session, complaint_in: ComplaintCreate, created_by: str) -> Complaint:
    ticket = generate_ticket_number()
    db_complaint = Complaint(
        ticket_number=ticket,
        created_by=created_by,
        **complaint_in.model_dump(),
    )
    db.add(db_complaint)
    db.commit()
    db.refresh(db_complaint)
    return db_complaint


def update_complaint(db: Session, complaint: Complaint, complaint_in: ComplaintUpdate) -> Complaint:
    update_data = complaint_in.model_dump(exclude_unset=True)
    old_status = complaint.status
    for field, value in update_data.items():
        setattr(complaint, field, value)
    # Auto-set resolved_at when status changes to resolved
    if "status" in update_data and update_data["status"] in ("resolved", "closed"):
        if not complaint.resolved_at:
            complaint.resolved_at = datetime.utcnow()
    db.commit()
    db.refresh(complaint)
    return complaint


def delete_complaint(db: Session, complaint: Complaint) -> None:
    db.delete(complaint)
    db.commit()
