from typing import List
from sqlalchemy.orm import Session
from app.models.uploaded_file import UploadedFile
from app.models.complaint import Complaint


def create_uploaded_file(
    db: Session,
    complaint_id: str,
    uploaded_by: str,
    filename: str,
    original_filename: str,
    filepath: str,
    file_type: str,
    file_size: int,
    extracted_text: str = None,
) -> UploadedFile:
    db_file = UploadedFile(
        complaint_id=complaint_id,
        uploaded_by=uploaded_by,
        filename=filename,
        original_filename=original_filename,
        filepath=filepath,
        file_type=file_type,
        file_size=file_size,
        extracted_text=extracted_text,
    )
    db.add(db_file)
    db.commit()
    db.refresh(db_file)
    return db_file


def get_files_for_complaint(db: Session, complaint_id: str) -> List[UploadedFile]:
    return db.query(UploadedFile).filter(UploadedFile.complaint_id == complaint_id).all()


def delete_uploaded_file(db: Session, file: UploadedFile) -> None:
    db.delete(file)
    db.commit()
