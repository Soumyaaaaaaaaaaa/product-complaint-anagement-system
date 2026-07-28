from pydantic import BaseModel, Field
from typing import Optional, List
from app.schemas.complaint import ComplaintPriority, ComplaintCategory


class ExtractionResult(BaseModel):
    title: Optional[str] = Field(None, description="A short, descriptive title of the complaint.")
    customer_name: Optional[str] = Field(None, description="Name of customer or healthcare professional.")
    company: Optional[str] = Field(None, description="Company, hospital, or medical store name.")
    product_name: Optional[str] = Field(None, description="The name of the product mentioned.")
    product_code: Optional[str] = Field(None, description="Product code, SKU or catalog number.")
    batch_number: Optional[str] = Field(None, description="The lot or batch number.")
    manufacturing_date: Optional[str] = Field(None, description="Manufacturing date of product.")
    expiry_date: Optional[str] = Field(None, description="Expiration date of product.")
    complaint_date: Optional[str] = Field(None, description="Date the complaint was reported.")
    category: Optional[str] = Field(None, description="Category (product_quality, packaging, labeling, etc.).")
    description: Optional[str] = Field(None, description="The full detailed description of the complaint.")
    severity: Optional[str] = Field(None, description="Severity of complaint (low, medium, high, critical).")
    risk_level: Optional[str] = Field(None, description="Risk level (low, medium, high, critical).")
    root_cause: Optional[str] = Field(None, description="Extracted or potential root cause.")
    capa_recommendation: Optional[str] = Field(None, description="Recommended CAPA actions.")
    investigation_notes: Optional[str] = Field(None, description="Notes on investigation or status.")
    priority: Optional[str] = Field(None, description="Priority (low, medium, high, critical).")
    quantity_affected: Optional[int] = Field(None, description="The quantity of product affected.")


class RiskClassification(BaseModel):
    priority: ComplaintPriority = Field(description="The priority of the complaint (low, medium, high, critical).")
    category: ComplaintCategory = Field(description="The category of the complaint.")


class SummaryResult(BaseModel):
    ai_summary: str = Field(description="A concise summary of the complaint.")
    ai_suggested_action: str = Field(description="Suggested next steps or actions to resolve the complaint.")
