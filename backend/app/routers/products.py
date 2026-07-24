from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from app.database import get_db
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from app.crud.product import get_product, get_products, create_product, update_product, delete_product, count_products, get_product_by_sku
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("/", response_model=List[ProductResponse])
def list_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    search: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_products(db, skip=skip, limit=limit, search=search, category=category)


@router.get("/count")
def get_product_count(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return {"count": count_products(db)}


@router.post("/", response_model=ProductResponse, status_code=201)
def create_new_product(
    product_in: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if get_product_by_sku(db, product_in.sku):
        raise HTTPException(status_code=400, detail="SKU already exists")
    return create_product(db, product_in)


@router.get("/{product_id}", response_model=ProductResponse)
def get_product_by_id(
    product_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    product = get_product(db, str(product_id))
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.put("/{product_id}", response_model=ProductResponse)
def update_product_by_id(
    product_id: UUID,
    product_in: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    product = get_product(db, str(product_id))
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return update_product(db, product, product_in)


@router.delete("/{product_id}", status_code=204)
def delete_product_by_id(
    product_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    product = get_product(db, str(product_id))
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    delete_product(db, product)
