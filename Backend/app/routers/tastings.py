from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.schemas.tasting_schema import Tasting, TastingCreate, TastingUpdate
from app.services.tasting_service import (
    get_tasting, get_tastings_by_user, get_tastings_by_whiskey,
    create_tasting, update_tasting, delete_tasting
)
from app.auth.auth import get_current_active_user

router = APIRouter()

@router.get("/tastings/", response_model=List[Tasting])
def read_tastings(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_active_user)
):
    """
    Retrieve all tastings for the current user
    """
    tastings = get_tastings_by_user(db, user_id=current_user.id, skip=skip, limit=limit)
    return tastings

@router.get("/whiskeys/{whiskey_id}/tastings/", response_model=List[Tasting])
def read_tastings_by_whiskey(
    whiskey_id: int, 
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_active_user)
):
    """
    Retrieve all tastings for a specific whiskey by the current user
    """
    tastings = get_tastings_by_whiskey(db, whiskey_id=whiskey_id, user_id=current_user.id, skip=skip, limit=limit)
    return tastings

@router.post("/tastings/", response_model=Tasting, status_code=status.HTTP_201_CREATED)
def create_new_tasting(
    tasting: TastingCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a new tasting for the current user
    """
    return create_tasting(db=db, tasting=tasting, user_id=current_user.id)

@router.get("/tastings/{tasting_id}", response_model=Tasting)
def read_tasting(
    tasting_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_active_user)
):
    """
    Retrieve a specific tasting by ID
    """
    db_tasting = get_tasting(db, tasting_id=tasting_id, user_id=current_user.id)
    if db_tasting is None:
        raise HTTPException(status_code=404, detail="Tasting not found")
    return db_tasting

@router.put("/tastings/{tasting_id}", response_model=Tasting)
def update_existing_tasting(
    tasting_id: int, 
    tasting: TastingUpdate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_active_user)
):
    """
    Update a tasting by ID
    """
    db_tasting = update_tasting(db, tasting_id=tasting_id, tasting_update_data=tasting, user_id=current_user.id)
    if db_tasting is None:
        raise HTTPException(status_code=404, detail="Tasting not found or not authorized")
    return db_tasting

@router.delete("/tastings/{tasting_id}", response_model=Tasting)
def delete_existing_tasting(
    tasting_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete a tasting by ID
    """
    db_tasting = delete_tasting(db, tasting_id=tasting_id, user_id=current_user.id)
    if db_tasting is None:
        raise HTTPException(status_code=404, detail="Tasting not found or not authorized")
    return db_tasting
