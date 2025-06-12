from typing import List

from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from fastapi import status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.auth import get_current_active_user
from app.db.database import get_db
from app.models.tasting import Tasting as TastingModel
from app.models.user import User
from app.schemas.tasting_schema import Tasting
from app.schemas.tasting_schema import TastingCreate
from app.schemas.tasting_schema import TastingUpdate
from app.services.tasting_service import create_tasting
from app.services.tasting_service import delete_tasting
from app.services.tasting_service import get_tasting
from app.services.tasting_service import get_tastings_by_user
from app.services.tasting_service import get_tastings_by_user_whiskey
from app.services.tasting_service import update_tasting

router = APIRouter()


@router.get("/tastings/", response_model=List[Tasting])
async def read_tastings(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> List[TastingModel]:
    return await get_tastings_by_user(
        db, user_id=current_user.id, skip=skip, limit=limit
    )


@router.get("/whiskeys/{user_whiskey_id}/tastings/", response_model=List[Tasting])
async def read_tastings_by_user_whiskey(
    user_whiskey_id: int,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> List[TastingModel]:
    return await get_tastings_by_user_whiskey(
        db,
        user_whiskey_id=user_whiskey_id,
        user_id=current_user.id,
        skip=skip,
        limit=limit,
    )


@router.post("/tastings/", response_model=Tasting, status_code=status.HTTP_201_CREATED)
async def create_new_tasting(
    tasting: TastingCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> TastingModel:
    """
    Create a new tasting for the current user
    """
    return await create_tasting(db=db, tasting=tasting, user_id=current_user.id)


@router.get("/tastings/{tasting_id}", response_model=Tasting)
async def read_tasting(
    tasting_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> TastingModel:
    """
    Retrieve a specific tasting by ID
    """
    db_tasting = await get_tasting(db, tasting_id=tasting_id, user_id=current_user.id)
    if db_tasting is None:
        raise HTTPException(status_code=404, detail="Tasting not found")
    return db_tasting


@router.put("/tastings/{tasting_id}", response_model=Tasting)
async def update_existing_tasting(
    tasting_id: int,
    tasting: TastingUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> TastingModel:
    """
    Update a tasting by ID
    """
    db_tasting = await update_tasting(
        db, tasting_id=tasting_id, tasting_update_data=tasting, user_id=current_user.id
    )
    if db_tasting is None:
        raise HTTPException(
            status_code=404, detail="Tasting not found or not authorized"
        )
    return db_tasting


@router.delete("/tastings/{tasting_id}", response_model=Tasting)
async def delete_existing_tasting(
    tasting_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> TastingModel:
    """
    Delete a tasting by ID
    """
    db_tasting = await delete_tasting(
        db, tasting_id=tasting_id, user_id=current_user.id
    )
    if db_tasting is None:
        raise HTTPException(
            status_code=404, detail="Tasting not found or not authorized"
        )
    return db_tasting
