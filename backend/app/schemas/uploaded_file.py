from pydantic import BaseModel
from datetime import datetime
from uuid import UUID
from typing import Optional


class UploadedFileResponse(BaseModel):
    id: UUID
    complaint_id: UUID
    uploaded_by: UUID
    filename: str
    original_filename: str
    filepath: str
    file_type: Optional[str] = None
    file_size: Optional[int] = None
    extracted_text: Optional[str] = None
    uploaded_at: datetime

    class Config:
        from_attributes = True
