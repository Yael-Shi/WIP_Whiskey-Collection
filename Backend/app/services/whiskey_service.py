from typing import List
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.whiskey import Whiskey as WhiskeyModel
from app.schemas.whiskey_schema import WhiskeyCreate as WhiskeyCreateSchema
from app.schemas.whiskey_schema import WhiskeyUpdate as WhiskeyUpdateSchema


async def get_whiskey(
    db: AsyncSession, whiskey_id: int, owner_id: int
) -> Optional[WhiskeyModel]:
    """
    Retrieve a single whiskey by its ID, ensuring it belongs to the owner.
    Uses FOR UPDATE to prevent race conditions when updating.
    """
    result = await db.execute(
        select(WhiskeyModel)
        .where(WhiskeyModel.id == whiskey_id, WhiskeyModel.owner_id == owner_id)
        .with_for_update()
    )
    return result.scalars().first()


async def get_whiskeys_by_owner(
    db: AsyncSession, owner_id: int, skip: int = 0, limit: int = 100
) -> List[WhiskeyModel]:
    """
    Retrieve a list of whiskeys for a specific owner with pagination.
    """
    result = await db.execute(
        select(WhiskeyModel)
        .where(WhiskeyModel.owner_id == owner_id)
        .offset(skip)
        .limit(limit)
    )
    return list(result.scalars().all())


async def create_whiskey(
    db: AsyncSession, whiskey: WhiskeyCreateSchema, owner_id: int
) -> WhiskeyModel:
    """
    Create a new whiskey for a specific owner.
    """
    db_whiskey = WhiskeyModel(**whiskey.dict(), owner_id=owner_id)
    db.add(db_whiskey)
    await db.flush()
    await db.refresh(db_whiskey)
    return db_whiskey


async def update_whiskey(
    db: AsyncSession,
    whiskey_id: int,
    whiskey_update_data: WhiskeyUpdateSchema,
    owner_id: int,
) -> Optional[WhiskeyModel]:
    """
    Update an existing whiskey.
    Ensures safe update using FOR UPDATE and transactional flush.
    """
    db_whiskey = await get_whiskey(
        db, whiskey_id, owner_id
    )  # Ensure user owns the whiskey
    if not db_whiskey:
        return None  # Or raise HTTPException

    update_data = whiskey_update_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_whiskey, key, value)

    await db.flush()
    await db.refresh(db_whiskey)
    return db_whiskey


async def delete_whiskey(
    db: AsyncSession, whiskey_id: int, owner_id: int
) -> Optional[WhiskeyModel]:
    """
    Delete a whiskey.
    Uses FOR UPDATE to ensure the record is locked before deletion.
    """
    db_whiskey = await get_whiskey(
        db, whiskey_id, owner_id
    )  # Ensure user owns the whiskey
    if not db_whiskey:
        return None  # Or raise HTTPException

    await db.delete(db_whiskey)
    await db.flush()
    return db_whiskey
