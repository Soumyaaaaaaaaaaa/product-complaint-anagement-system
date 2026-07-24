import json
import logging
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
from app.config import settings
from app.services.workflow import get_llm, _clean_json
from app.services.prompts import ROOT_CAUSE_PROMPT, CAPA_PROMPT
from app.schemas.ai_analysis import RootCauseResponse, CAPAResponse, DuplicateResponse
from app.models.complaint import Complaint

logger = logging.getLogger(__name__)

def analyze_root_cause(complaint_data: dict) -> RootCauseResponse:
    llm = get_llm()
    chain = ROOT_CAUSE_PROMPT | llm
    
    response = chain.invoke({"complaint_data": json.dumps(complaint_data)})
    try:
        cleaned = _clean_json(response.content)
        data = json.loads(cleaned)
        return RootCauseResponse(**data)
    except Exception as e:
        logger.error(f"Failed to parse Root Cause AI response: {e}")
        return RootCauseResponse(
            root_cause="Analysis failed", 
            confidence_score=0.0, 
            reasoning="Could not parse AI response."
        )

def recommend_capa(complaint_data: dict) -> CAPAResponse:
    llm = get_llm()
    chain = CAPA_PROMPT | llm
    
    response = chain.invoke({"complaint_data": json.dumps(complaint_data)})
    try:
        cleaned = _clean_json(response.content)
        data = json.loads(cleaned)
        return CAPAResponse(**data)
    except Exception as e:
        logger.error(f"Failed to parse CAPA AI response: {e}")
        return CAPAResponse(
            corrective_actions=["Analysis failed"], 
            preventive_actions=["Analysis failed"]
        )

def find_potential_duplicates(complaint_id: str, db: Session) -> DuplicateResponse:
    # Basic logic: Find complaints with the same category and product within the last X days.
    # We will simulate the AI duplicate detection for now, as true AI detection requires embeddings (Vector DB).
    
    current_complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not current_complaint:
        return DuplicateResponse(duplicate_ids=[], similarity_score=0.0)
        
    duplicates = db.query(Complaint).filter(
        Complaint.id != complaint_id,
        Complaint.category == current_complaint.category,
        Complaint.product_id == current_complaint.product_id
    ).limit(5).all()
    
    duplicate_ids = [str(c.id) for c in duplicates]
    score = 0.85 if len(duplicate_ids) > 0 else 0.0
    
    return DuplicateResponse(duplicate_ids=duplicate_ids, similarity_score=score)

def log_ai_action(db: Session, complaint: Complaint, action: str, details: str):
    import datetime
    if not complaint.ai_analysis_data:
        complaint.ai_analysis_data = {}
        
    timeline = complaint.ai_analysis_data.get("timeline", [])
    timeline.append({
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "action": action,
        "details": details
    })
    
    complaint.ai_analysis_data["timeline"] = timeline
    
    # Notice we must tell SQLAlchemy that the JSON has changed
    from sqlalchemy.orm.attributes import flag_modified
    flag_modified(complaint, "ai_analysis_data")
    db.commit()
