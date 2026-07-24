from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from app.database import get_db
from app.schemas.customer import CustomerCreate, CustomerUpdate, CustomerResponse
from app.crud.customer import get_customer, get_customers, create_customer, update_customer, delete_customer, count_customers
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter(prefix="/customers", tags=["Customers"])


@router.get("/", response_model=List[CustomerResponse])
def list_customers(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_customers(db, skip=skip, limit=limit, search=search)


@router.get("/count")
def get_customer_count(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return {"count": count_customers(db)}


@router.post("/", response_model=CustomerResponse, status_code=201)
def create_new_customer(
    customer_in: CustomerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_customer(db, customer_in)


@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer_by_id(
    customer_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    customer = get_customer(db, str(customer_id))
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


@router.put("/{customer_id}", response_model=CustomerResponse)
def update_customer_by_id(
    customer_id: UUID,
    customer_in: CustomerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    customer = get_customer(db, str(customer_id))
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return update_customer(db, customer, customer_in)


@router.delete("/{customer_id}", status_code=204)
def delete_customer_by_id(
    customer_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    customer = get_customer(db, str(customer_id))
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    delete_customer(db, customer)
