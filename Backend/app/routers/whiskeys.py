from typing import List

from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from fastapi import status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.auth import get_current_active_user
from app.db.database import get_db
from app.models.user import User
from app.models.user_whiskey import UserWhiskey as UserWhiskeyModel
from app.schemas.user_whiskey_schema import UserWhiskey
from app.schemas.user_whiskey_schema import UserWhiskeyCreate
from app.schemas.user_whiskey_schema import UserWhiskeyUpdate
from app.services.user_whiskey_service import create_user_whiskey
from app.services.user_whiskey_service import delete_user_whiskey
from app.services.user_whiskey_service import get_user_whiskey
from app.services.user_whiskey_service import get_user_whiskeys
from app.services.user_whiskey_service import update_user_whiskey

router = APIRouter()


@router.get("/whiskeys/", response_model=List[UserWhiskey])
async def read_user_whiskeys(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> List[UserWhiskeyModel]:
    return await get_user_whiskeys(db, user_id=current_user.id, skip=skip, limit=limit)


@router.post(
    "/whiskeys/", response_model=UserWhiskey, status_code=status.HTTP_201_CREATED
)
async def create_user_whiskey_entry(
    whiskey: UserWhiskeyCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> UserWhiskeyModel:
    return await create_user_whiskey(
        db=db, user_whiskey=whiskey, user_id=current_user.id
    )


@router.get("/whiskeys/{user_whiskey_id}", response_model=UserWhiskey)
async def read_single_user_whiskey(
    user_whiskey_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> UserWhiskeyModel:
    whiskey = await get_user_whiskey(
        db, user_whiskey_id=user_whiskey_id, user_id=current_user.id
    )
    if not whiskey:
        raise HTTPException(status_code=404, detail="Whiskey not found")
    return whiskey


@router.put("/whiskeys/{user_whiskey_id}", response_model=UserWhiskey)
async def update_user_whiskey_entry(
    user_whiskey_id: int,
    whiskey: UserWhiskeyUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> UserWhiskeyModel:
    updated = await update_user_whiskey(
        db,
        user_whiskey_id=user_whiskey_id,
        user_id=current_user.id,
        update_data=whiskey,
    )
    if not updated:
        raise HTTPException(
            status_code=404, detail="Whiskey not found or not authorized"
        )
    return updated


@router.delete("/whiskeys/{user_whiskey_id}", response_model=UserWhiskey)
async def delete_user_whiskey_entry(
    user_whiskey_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> UserWhiskeyModel:
    deleted = await delete_user_whiskey(
        db, user_whiskey_id=user_whiskey_id, user_id=current_user.id
    )
    if not deleted:
        raise HTTPException(
            status_code=404, detail="Whiskey not found or not authorized"
        )
    return deleted
