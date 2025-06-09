from typing import List

from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from fastapi import status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.auth import get_current_active_user
from app.db.database import get_db
from app.models.user import User
from app.models.whiskey import Whiskey as WhiskeyModel
from app.schemas.whiskey_schema import Whiskey
from app.schemas.whiskey_schema import WhiskeyCreate
from app.schemas.whiskey_schema import WhiskeyUpdate
from app.services.whiskey_service import create_whiskey
from app.services.whiskey_service import delete_whiskey
from app.services.whiskey_service import get_whiskey
from app.services.whiskey_service import get_whiskeys_by_owner
from app.services.whiskey_service import update_whiskey

router = APIRouter()


@router.get("/whiskeys/", response_model=List[Whiskey])
async def read_whiskeys(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> List[WhiskeyModel]:
    """
    Retrieve all whiskeys for the current user
    """
    whiskeys = await get_whiskeys_by_owner(
        db, owner_id=current_user.id, skip=skip, limit=limit
    )
    return whiskeys


@router.post("/whiskeys/", response_model=Whiskey, status_code=status.HTTP_201_CREATED)
async def create_new_whiskey(
    whiskey: WhiskeyCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> WhiskeyModel:
    """
    Create a new whiskey for the current user
    """
    return await create_whiskey(db=db, whiskey=whiskey, owner_id=current_user.id)


@router.get("/whiskeys/{whiskey_id}", response_model=Whiskey)
async def read_whiskey(
    whiskey_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> WhiskeyModel:
    """
    Retrieve a specific whiskey by ID
    """
    db_whiskey = await get_whiskey(db, whiskey_id=whiskey_id, owner_id=current_user.id)
    if db_whiskey is None:
        raise HTTPException(status_code=404, detail="Whiskey not found")
    return db_whiskey


@router.put("/whiskeys/{whiskey_id}", response_model=Whiskey)
async def update_existing_whiskey(
    whiskey_id: int,
    whiskey: WhiskeyUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> WhiskeyModel:
    """
    Update a whiskey by ID
    """
    db_whiskey = await update_whiskey(
        db, whiskey_id=whiskey_id, whiskey_update_data=whiskey, owner_id=current_user.id
    )
    if db_whiskey is None:
        raise HTTPException(
            status_code=404, detail="Whiskey not found or not authorized"
        )
    return db_whiskey


@router.delete("/whiskeys/{whiskey_id}", response_model=Whiskey)
async def delete_existing_whiskey(
    whiskey_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> WhiskeyModel:
    """
    Delete a whiskey by ID
    """
    db_whiskey = await delete_whiskey(
        db, whiskey_id=whiskey_id, owner_id=current_user.id
    )
    if db_whiskey is None:
        raise HTTPException(
            status_code=404, detail="Whiskey not found or not authorized"
        )
    return db_whiskey
