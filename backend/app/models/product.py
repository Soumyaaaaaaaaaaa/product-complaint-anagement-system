import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, Boolean, Enum as SAEnum
from sqlalchemy import UUID
from sqlalchemy.orm import relationship
from app.database import Base
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


class Product(Base):
    __tablename__ = "products"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String(255), nullable=False, index=True)
    sku = Column(String(100), unique=True, nullable=False, index=True)
    batch_number = Column(String(100), nullable=True)
    category = Column(SAEnum(ProductCategory), default=ProductCategory.other, nullable=False)
    manufacturer = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    active_ingredient = Column(String(255), nullable=True)
    strength = Column(String(100), nullable=True)
    storage_conditions = Column(String(255), nullable=True)
    expiry_date = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    complaints = relationship("Complaint", back_populates="product")

    def __repr__(self) -> str:
        return f"<Product {self.name} ({self.sku})>"

