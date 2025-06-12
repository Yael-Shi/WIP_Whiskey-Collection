from typing import List
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.tasting import Tasting as TastingModel
from app.schemas.tasting_schema import TastingCreate as TastingCreateSchema
from app.schemas.tasting_schema import TastingUpdate as TastingUpdateSchema


async def get_tasting(
    db: AsyncSession, tasting_id: int, user_id: int
) -> Optional[TastingModel]:
    """
    Retrieve a single tasting by its ID, ensuring it belongs to the user.
    Uses FOR UPDATE to lock the row.
    """
    result = await db.execute(
        select(TastingModel)
        .where(
            TastingModel.id == tasting_id,
            TastingModel.user_id == user_id,
        )
        .with_for_update()
    )
    return result.scalars().first()


async def get_tastings_by_user(
    db: AsyncSession, user_id: int, skip: int = 0, limit: int = 100
) -> List[TastingModel]:
    """
    Retrieve a list of tastings for a specific user with pagination.
    """
    result = await db.execute(
        select(TastingModel)
        .where(TastingModel.user_id == user_id)
        .offset(skip)
        .limit(limit)
    )
    return list(result.scalars().all())


async def get_tastings_by_user_whiskey(
    db: AsyncSession,
    user_whiskey_id: int,
    user_id: int,
    skip: int = 0,
    limit: int = 100,
) -> List[TastingModel]:
    """
    Retrieve tastings for a specific user_whiskey and user.
    """
    result = await db.execute(
        select(TastingModel)
        .where(
            TastingModel.user_whiskey_id == user_whiskey_id,
            TastingModel.user_id == user_id,
        )
        .offset(skip)
        .limit(limit)
    )
    return list(result.scalars().all())


async def create_tasting(
    db: AsyncSession, tasting: TastingCreateSchema, user_id: int
) -> TastingModel:
    """
    Create a new tasting for a specific user.
    The user_whiskey_id is part of the TastingCreateSchema.
    """
    db_tasting = TastingModel(**tasting.dict(), user_id=user_id)
    db.add(db_tasting)
    await db.flush()
    await db.refresh(db_tasting)
    return db_tasting


async def update_tasting(
    db: AsyncSession,
    tasting_id: int,
    tasting_update_data: TastingUpdateSchema,
    user_id: int,
) -> Optional[TastingModel]:
    """
    Update an existing tasting.
    """
    db_tasting = await get_tasting(
        db, tasting_id, user_id
    )  # Ensure user owns the tasting
    if not db_tasting:
        return None  # Or raise HTTPException

    update_data = tasting_update_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_tasting, key, value)

    await db.flush()
    await db.refresh(db_tasting)
    return db_tasting


async def delete_tasting(
    db: AsyncSession, tasting_id: int, user_id: int
) -> Optional[TastingModel]:
    """
    Delete a tasting.
    """
    db_tasting = await get_tasting(
        db, tasting_id, user_id
    )  # Ensure user owns the tasting
    if not db_tasting:
        return None  # Or raise HTTPException

    await db.delete(db_tasting)
    await db.flush()
    return db_tasting
