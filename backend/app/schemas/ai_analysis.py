from pydantic import BaseModel, Field
from typing import Optional, List, Any


class FieldWithConfidence(BaseModel):
    value: Any = Field(description="The extracted value.")
    confidence: float = Field(description="Confidence score from 0.0 to 1.0.")


class RootCauseResponse(BaseModel):
    root_cause: str = Field(description="The suggested root cause of the complaint.")
    confidence_score: float = Field(description="Confidence score of the root cause from 0.0 to 1.0.")
    reasoning: str = Field(description="A brief explanation of why this root cause was suggested.")


class CAPAResponse(BaseModel):
    corrective_actions: List[str] = Field(description="List of corrective actions to address the immediate issue.")
    preventive_actions: List[str] = Field(description="List of preventive actions to stop it from happening again.")
    

class DuplicateResponse(BaseModel):
    duplicate_ids: List[str] = Field(description="List of UUIDs of potentially duplicate complaints.")
    similarity_score: float = Field(description="A score from 0.0 to 1.0 indicating how similar they are.")


class CompletenessResponse(BaseModel):
    is_complete: bool = Field(description="Whether the complaint contains all necessary information.")
    missing_critical_fields: List[str] = Field(description="List of required fields that are missing.")


class AiTimelineEvent(BaseModel):
    timestamp: str
    action: str
    details: str
