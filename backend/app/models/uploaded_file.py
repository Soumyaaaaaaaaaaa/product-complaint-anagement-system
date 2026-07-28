import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, BigInteger, Text
from sqlalchemy import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class UploadedFile(Base):
    __tablename__ = "uploaded_files"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    complaint_id = Column(UUID(as_uuid=True), ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False, index=True)
    uploaded_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    filepath = Column(String(512), nullable=False)
    file_type = Column(String(100), nullable=True)
    file_size = Column(BigInteger, nullable=True)
    extracted_text = Column(Text, nullable=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    complaint = relationship("Complaint", back_populates="uploaded_files")
    uploader = relationship("User", back_populates="uploaded_files")

    def __repr__(self) -> str:
        return f"<UploadedFile {self.original_filename}>"
