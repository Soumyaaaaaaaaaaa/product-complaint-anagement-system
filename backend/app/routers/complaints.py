import os
import uuid
import aiofiles
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from uuid import UUID
from app.database import get_db
from app.schemas.complaint import ComplaintCreate, ComplaintUpdate, ComplaintResponse
from app.schemas.uploaded_file import UploadedFileResponse
from app.schemas.audit_log import AuditAction
from app.crud.complaint import get_complaint, get_complaints, create_complaint, update_complaint, delete_complaint, count_complaints
from app.crud.uploaded_file import create_uploaded_file, get_files_for_complaint, delete_uploaded_file
from app.crud.audit_log import create_audit_log
from app.core.security import get_current_user
from app.models.user import User
from app.config import settings
from app.services.text_extraction import extract_text_from_file
from app.services.workflow import app_workflow
from app.schemas.ai_analysis import RootCauseResponse, CAPAResponse, DuplicateResponse, AiTimelineEvent
from app.services.ai_analysis import analyze_root_cause, recommend_capa, find_potential_duplicates, log_ai_action
from app.services.export import generate_excel_export, generate_pdf_export
from pydantic import BaseModel

router = APIRouter(prefix="/complaints", tags=["Complaints"])


@router.get("/", response_model=List[ComplaintResponse])
def list_complaints(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    search: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    category: Optional[str] = None,
    assigned_to: Optional[str] = None,
    from_date: Optional[datetime] = None,
    to_date: Optional[datetime] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_complaints(
        db,
        skip=skip,
        limit=limit,
        search=search,
        status=status,
        priority=priority,
        category=category,
        assigned_to=assigned_to,
        from_date=from_date,
        to_date=to_date,
    )


@router.get("/stats")
def get_complaint_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return {
        "total": count_complaints(db),
        "open": count_complaints(db, status="open"),
        "in_progress": count_complaints(db, status="in_progress"),
        "resolved": count_complaints(db, status="resolved"),
        "critical": count_complaints(db, status=None),
    }


@router.post("/", response_model=ComplaintResponse, status_code=201)
def create_new_complaint(
    complaint_in: ComplaintCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    complaint = create_complaint(db, complaint_in, created_by=str(current_user.id))
    create_audit_log(
        db,
        action=AuditAction.create,
        entity_type="complaint",
        user_id=str(current_user.id),
        entity_id=str(complaint.id),
        new_values={"ticket_number": complaint.ticket_number, "title": complaint.title},
        ip_address=request.client.host if request.client else None,
        description=f"Complaint {complaint.ticket_number} created",
    )
    return complaint


@router.post("/draft", response_model=ComplaintResponse, status_code=201)
def create_complaint_draft(
    complaint_in: ComplaintCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    complaint_in.is_draft = True
    complaint = create_complaint(db, complaint_in, created_by=str(current_user.id))
    return complaint


@router.get("/{complaint_id}", response_model=ComplaintResponse)
def get_complaint_by_id(
    complaint_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    complaint = get_complaint(db, str(complaint_id))
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return complaint


@router.put("/{complaint_id}", response_model=ComplaintResponse)
def update_complaint_by_id(
    complaint_id: UUID,
    complaint_in: ComplaintUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    complaint = get_complaint(db, str(complaint_id))
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    old_values = {"status": complaint.status.value, "priority": complaint.priority.value}
    updated = update_complaint(db, complaint, complaint_in)
    new_values = {"status": updated.status.value, "priority": updated.priority.value}

    create_audit_log(
        db,
        action=AuditAction.update,
        entity_type="complaint",
        user_id=str(current_user.id),
        entity_id=str(complaint_id),
        old_values=old_values,
        new_values=new_values,
        ip_address=request.client.host if request.client else None,
    )
    return updated


@router.delete("/{complaint_id}", status_code=204)
def delete_complaint_by_id(
    complaint_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    complaint = get_complaint(db, str(complaint_id))
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    delete_complaint(db, complaint)


@router.get("/{complaint_id}/files", response_model=List[UploadedFileResponse])
def list_complaint_files(
    complaint_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_files_for_complaint(db, str(complaint_id))


@router.post("/{complaint_id}/files", response_model=UploadedFileResponse, status_code=201)
async def upload_complaint_file(
    complaint_id: UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    complaint = get_complaint(db, str(complaint_id))
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    max_size = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    content = await file.read()
    if len(content) > max_size:
        raise HTTPException(status_code=413, detail=f"File too large. Max size: {settings.MAX_UPLOAD_SIZE_MB}MB")

    upload_dir = os.path.join(settings.UPLOAD_DIR, str(complaint_id))
    os.makedirs(upload_dir, exist_ok=True)

    safe_filename = f"{uuid.uuid4()}_{file.filename}"
    filepath = os.path.join(upload_dir, safe_filename)

    async with aiofiles.open(filepath, "wb") as f:
        await f.write(content)

    # Extract text from the file
    extracted_text = extract_text_from_file(filepath, file.content_type)

    db_file = create_uploaded_file(
        db,
        complaint_id=str(complaint_id),
        uploaded_by=str(current_user.id),
        filename=safe_filename,
        original_filename=file.filename,
        filepath=filepath,
        file_type=file.content_type,
        file_size=len(content),
        extracted_text=extracted_text,
    )
    return db_file


@router.delete("/{complaint_id}/files/{file_id}", status_code=204)
def delete_complaint_file(
    complaint_id: UUID,
    file_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.models.uploaded_file import UploadedFile
    file = db.query(UploadedFile).filter(
        UploadedFile.id == str(file_id),
        UploadedFile.complaint_id == str(complaint_id),
    ).first()
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    if os.path.exists(file.filepath):
        os.remove(file.filepath)
    delete_uploaded_file(db, file)


@router.post("/upload")
async def upload_and_parse_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    """
    Production-ready document upload endpoint.
    Accepts PDF, DOCX, Images, TXT.
    Extracts raw text via PyMuPDF / pdfplumber / OCR (pytesseract) / python-docx.
    Passes text into LangGraph / AI parsing.
    Returns structured parsed complaint JSON.
    Never returns 500 on valid upload.
    """
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    allowed_exts = {".pdf", ".docx", ".png", ".jpg", ".jpeg", ".tiff", ".bmp", ".txt"}
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in allowed_exts:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported file format '{file_ext}'. Allowed formats: PDF, DOCX, PNG, JPG, JPEG, TXT"
        )
    
    max_size = 15 * 1024 * 1024
    content = await file.read()
    if len(content) > max_size:
        raise HTTPException(status_code=400, detail="File exceeds maximum allowed size of 15MB")
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty (0 bytes)")

    temp_dir = os.path.join(settings.UPLOAD_DIR, "temp")
    os.makedirs(temp_dir, exist_ok=True)
    temp_filename = f"{uuid.uuid4()}_{file.filename}"
    filepath = os.path.join(temp_dir, temp_filename)

    try:
        async with aiofiles.open(filepath, "wb") as f:
            await f.write(content)

        raw_text = extract_text_from_file(filepath, file.content_type)
        if not raw_text or not raw_text.strip():
            raw_text = f"[Scanned/Image document processed: {file.filename}]"

        from app.services.workflow import extract_node
        state = {"extracted_text": raw_text, "parsed_data": {}}
        state = extract_node(state)
        parsed_data = state.get("parsed_data", {})

        return {
            "success": True,
            "filename": file.filename,
            "raw_text": raw_text,
            "parsed_data": parsed_data
        }
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Could not process document: {str(e)}")
    finally:
        if os.path.exists(filepath):
            try:
                os.remove(filepath)
            except Exception:
                pass


class ChatInput(BaseModel):
    message: str

@router.post("/workflow/start")
async def start_workflow(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    thread_id = str(uuid.uuid4())
    content = await file.read()
    
    upload_dir = os.path.join(settings.UPLOAD_DIR, "temp")
    os.makedirs(upload_dir, exist_ok=True)
    filepath = os.path.join(upload_dir, f"{thread_id}_{file.filename}")
    
    async with aiofiles.open(filepath, "wb") as f:
        await f.write(content)
        
    extracted_text = extract_text_from_file(filepath, file.content_type)
    if not extracted_text:
        raise HTTPException(status_code=400, detail="Could not extract text from file")
        
    config = {"configurable": {"thread_id": thread_id}}
    state = app_workflow.invoke({"thread_id": thread_id, "extracted_text": extracted_text}, config)
    
    return {"thread_id": thread_id, "state": state}

@router.post("/workflow/{thread_id}/chat")
def chat_workflow(
    thread_id: str,
    chat_input: ChatInput,
    current_user: User = Depends(get_current_user),
):
    config = {"configurable": {"thread_id": thread_id}}
    state = app_workflow.invoke({"user_input": chat_input.message}, config)
    return {"thread_id": thread_id, "state": state}

@router.post("/workflow/{thread_id}/finalize")
def finalize_workflow(
    thread_id: str,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    config = {"configurable": {"thread_id": thread_id}}
    current_state = app_workflow.get_state(config)
    
    if not current_state or not current_state.values:
        raise HTTPException(status_code=404, detail="Workflow thread not found")
        
    final_complaint_data = current_state.values.get("final_complaint")
    if not final_complaint_data:
        raise HTTPException(status_code=400, detail="Workflow has not reached the final save state.")
        
    # Provide defaults for missing fields to avoid pydantic errors on ComplaintCreate if needed
    complaint_in = ComplaintCreate(
        title=final_complaint_data.get("title", "Untitled Complaint"),
        description=final_complaint_data.get("description", "No description provided"),
        product_name=final_complaint_data.get("product_name"),
        lot_number=final_complaint_data.get("lot_number"),
        quantity_affected=final_complaint_data.get("quantity_affected"),
        priority=final_complaint_data.get("priority", "medium"),
        category=final_complaint_data.get("category", "other"),
    )
    
    complaint = create_complaint(db, complaint_in, created_by=str(current_user.id))
    return complaint


@router.post("/{complaint_id}/analyze/root-cause", response_model=RootCauseResponse)
def analyze_complaint_root_cause(
    complaint_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    complaint = get_complaint(db, str(complaint_id))
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    complaint_data = {
        "title": complaint.title,
        "description": complaint.description,
        "category": complaint.category.value
    }
    
    result = analyze_root_cause(complaint_data)
    log_ai_action(db, complaint, "Root Cause Analysis", f"Suggested: {result.root_cause}")
    return result

@router.post("/{complaint_id}/analyze/capa", response_model=CAPAResponse)
def analyze_complaint_capa(
    complaint_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    complaint = get_complaint(db, str(complaint_id))
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    complaint_data = {
        "title": complaint.title,
        "description": complaint.description,
        "category": complaint.category.value
    }
    
    result = recommend_capa(complaint_data)
    log_ai_action(db, complaint, "CAPA Generation", "Generated corrective and preventive actions")
    return result

@router.get("/{complaint_id}/analyze/duplicates", response_model=DuplicateResponse)
def get_complaint_duplicates(
    complaint_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    complaint = get_complaint(db, str(complaint_id))
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    result = find_potential_duplicates(str(complaint_id), db)
    log_ai_action(db, complaint, "Duplicate Check", f"Found {len(result.duplicate_ids)} potential duplicates")
    return result

@router.get("/{complaint_id}/ai-timeline", response_model=List[AiTimelineEvent])
def get_complaint_ai_timeline(
    complaint_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    complaint = get_complaint(db, str(complaint_id))
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    if not complaint.ai_analysis_data:
        return []
        
    return complaint.ai_analysis_data.get("timeline", [])


@router.get("/export/excel")
def export_complaints_excel(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    complaints = get_complaints(db, skip=0, limit=10000)
    stream = generate_excel_export(complaints)
    return StreamingResponse(
        stream, 
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=complaints_export.xlsx"}
    )

@router.get("/{complaint_id}/export/pdf")
def export_complaint_pdf(
    complaint_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    complaint = get_complaint(db, str(complaint_id))
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    stream = generate_pdf_export(complaint)
    return StreamingResponse(
        stream, 
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=complaint_{complaint.ticket_number}.pdf"}
    )
