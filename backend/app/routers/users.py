from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from app.database import get_db
from app.schemas.user import UserResponse, UserCreate, UserUpdate
from app.crud.user import get_user, get_users, create_user, update_user, delete_user, count_users, get_user_by_email
from app.core.security import get_current_user, require_role
from app.models.user import User

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/", response_model=List[UserResponse])
def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    search: Optional[str] = None,
    role: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "manager")),
):
    return get_users(db, skip=skip, limit=limit, search=search, role=role)


@router.get("/count")
def get_user_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return {"count": count_users(db)}


@router.post("/", response_model=UserResponse, status_code=201)
def create_new_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    if get_user_by_email(db, user_in.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    return create_user(db, user_in)


@router.get("/{user_id}", response_model=UserResponse)
def get_user_by_id(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user = get_user(db, str(user_id))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/{user_id}", response_model=UserResponse)
def update_user_by_id(
    user_id: UUID,
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Users can update themselves; admins can update anyone
    if str(current_user.id) != str(user_id) and current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    user = get_user(db, str(user_id))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return update_user(db, user, user_in)


@router.delete("/{user_id}", status_code=204)
def delete_user_by_id(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    user = get_user(db, str(user_id))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    delete_user(db, user)
