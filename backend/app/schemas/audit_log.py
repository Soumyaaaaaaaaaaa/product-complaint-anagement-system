from pydantic import BaseModel
from datetime import datetime
from uuid import UUID
from typing import Optional, Any, Dict
import enum


class AuditAction(str, enum.Enum):
    create = "create"
    update = "update"
    delete = "delete"
    login = "login"
    logout = "logout"
    upload = "upload"
    download = "download"
    status_change = "status_change"


class AuditLogResponse(BaseModel):
    id: UUID
    user_id: Optional[UUID] = None
    entity_type: str
    entity_id: Optional[str] = None
    action: AuditAction
    old_values: Optional[Dict[str, Any]] = None
    new_values: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None
    description: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
