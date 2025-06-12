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
from app.services import user_whiskey_service

router = APIRouter()


@router.get("/user-whiskeys/", response_model=List[UserWhiskey])
async def read_user_whiskeys(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> List[UserWhiskeyModel]:
    """
    Retrieve the current user's whiskey collection.
    """
    return await user_whiskey_service.get_user_whiskeys(
        db=db, user_id=current_user.id, skip=skip, limit=limit
    )


@router.get("/user-whiskeys/{user_whiskey_id}", response_model=UserWhiskey)
async def read_user_whiskey(
    user_whiskey_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> UserWhiskeyModel:
    """
    Retrieve a specific whiskey from the current user's collection.
    """
    user_whiskey = await user_whiskey_service.get_user_whiskey(
        db=db, user_whiskey_id=user_whiskey_id, user_id=current_user.id
    )
    if not user_whiskey:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User whiskey not found",
        )
    return user_whiskey


@router.post(
    "/user-whiskeys/", response_model=UserWhiskey, status_code=status.HTTP_201_CREATED
)
async def create_user_whiskey(
    user_whiskey: UserWhiskeyCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> UserWhiskeyModel:
    """
    Add a whiskey to the current user's collection.
    """
    return await user_whiskey_service.create_user_whiskey(
        db=db, user_whiskey=user_whiskey, user_id=current_user.id
    )


@router.put("/user-whiskeys/{user_whiskey_id}", response_model=UserWhiskey)
async def update_user_whiskey(
    user_whiskey_id: int,
    user_whiskey_update: UserWhiskeyUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> UserWhiskeyModel:
    """
    Update a whiskey in the current user's collection.
    """
    updated = await user_whiskey_service.update_user_whiskey(
        db=db,
        user_whiskey_id=user_whiskey_id,
        user_id=current_user.id,
        update_data=user_whiskey_update,
    )
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User whiskey not found or not authorized",
        )
    return updated


@router.delete("/user-whiskeys/{user_whiskey_id}", response_model=UserWhiskey)
async def delete_user_whiskey(
    user_whiskey_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> UserWhiskeyModel:
    """
    Delete a whiskey from the current user's collection.
    """
    deleted = await user_whiskey_service.delete_user_whiskey(
        db=db, user_whiskey_id=user_whiskey_id, user_id=current_user.id
    )
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User whiskey not found or not authorized",
        )
    return deleted
