from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID
import enum


class ProductCategory(str, enum.Enum):
    tablet = "tablet"
    capsule = "capsule"
    injection = "injection"
    syrup = "syrup"
    cream = "cream"
    ointment = "ointment"
    inhaler = "inhaler"
    drops = "drops"
    other = "other"


class ProductBase(BaseModel):
    name: str
    sku: str
    batch_number: Optional[str] = None
    category: ProductCategory = ProductCategory.other
    manufacturer: Optional[str] = None
    description: Optional[str] = None
    active_ingredient: Optional[str] = None
    strength: Optional[str] = None
    storage_conditions: Optional[str] = None
    expiry_date: Optional[datetime] = None
    is_active: bool = True


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    batch_number: Optional[str] = None
    category: Optional[ProductCategory] = None
    manufacturer: Optional[str] = None
    description: Optional[str] = None
    active_ingredient: Optional[str] = None
    strength: Optional[str] = None
    storage_conditions: Optional[str] = None
    expiry_date: Optional[datetime] = None
    is_active: Optional[bool] = None


class ProductResponse(ProductBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
