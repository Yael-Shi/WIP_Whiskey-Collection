from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.schemas.whiskey_schema import Whiskey, WhiskeyCreate, WhiskeyUpdate
from app.services.whiskey_service import (
    get_whiskey, get_whiskeys_by_owner, create_whiskey, update_whiskey, delete_whiskey
)
from app.auth.auth import get_current_active_user

router = APIRouter()

@router.get("/whiskeys/", response_model=List[Whiskey])
def read_whiskeys(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_active_user)
):
    """
    Retrieve all whiskeys for the current user
    """
    whiskeys = get_whiskeys_by_owner(db, owner_id=current_user.id, skip=skip, limit=limit)
    return whiskeys

@router.post("/whiskeys/", response_model=Whiskey, status_code=status.HTTP_201_CREATED)
def create_new_whiskey(
    whiskey: WhiskeyCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a new whiskey for the current user
    """
    return create_whiskey(db=db, whiskey=whiskey, owner_id=current_user.id)

@router.get("/whiskeys/{whiskey_id}", response_model=Whiskey)
def read_whiskey(
    whiskey_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_active_user)
):
    """
    Retrieve a specific whiskey by ID
    """
    db_whiskey = get_whiskey(db, whiskey_id=whiskey_id, owner_id=current_user.id)
    if db_whiskey is None:
        raise HTTPException(status_code=404, detail="Whiskey not found")
    return db_whiskey

@router.put("/whiskeys/{whiskey_id}", response_model=Whiskey)
def update_existing_whiskey(
    whiskey_id: int, 
    whiskey: WhiskeyUpdate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_active_user)
):
    """
    Update a whiskey by ID
    """
    db_whiskey = update_whiskey(db, whiskey_id=whiskey_id, whiskey_update_data=whiskey, owner_id=current_user.id)
    if db_whiskey is None:
        raise HTTPException(status_code=404, detail="Whiskey not found or not authorized")
    return db_whiskey

@router.delete("/whiskeys/{whiskey_id}", response_model=Whiskey)
def delete_existing_whiskey(
    whiskey_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete a whiskey by ID
    """
    db_whiskey = delete_whiskey(db, whiskey_id=whiskey_id, owner_id=current_user.id)
    if db_whiskey is None:
        raise HTTPException(status_code=404, detail="Whiskey not found or not authorized")
    return db_whiskey
