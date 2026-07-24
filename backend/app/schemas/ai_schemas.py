from pydantic import BaseModel, Field
from typing import Optional, List
from app.schemas.complaint import ComplaintPriority, ComplaintCategory


class ExtractionResult(BaseModel):
    title: Optional[str] = Field(None, description="A short, descriptive title of the complaint.")
    description: Optional[str] = Field(None, description="The full detailed description of the complaint.")
    lot_number: Optional[str] = Field(None, description="The lot or batch number of the product mentioned.")
    quantity_affected: Optional[int] = Field(None, description="The quantity of the product affected.")
    product_name: Optional[str] = Field(None, description="The name of the product mentioned.")


class RiskClassification(BaseModel):
    priority: ComplaintPriority = Field(description="The priority of the complaint (low, medium, high, critical).")
    category: ComplaintCategory = Field(description="The category of the complaint.")


class SummaryResult(BaseModel):
    ai_summary: str = Field(description="A concise summary of the complaint.")
    ai_suggested_action: str = Field(description="Suggested next steps or actions to resolve the complaint.")
