from typing import List
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.distillery import Distillery as DistilleryModel
from app.schemas.distillery_schema import DistilleryCreate
from app.schemas.distillery_schema import DistilleryUpdate


async def get_distillery(
    db: AsyncSession, distillery_id: int
) -> Optional[DistilleryModel]:
    """
    Retrieve a single distillery by its ID.
    Uses FOR UPDATE to ensure safe concurrent access.
    """
    result = await db.execute(
        select(DistilleryModel)
        .where(DistilleryModel.id == distillery_id)
        .with_for_update()
    )
    return result.scalars().first()


async def get_distillery_by_name(
    db: AsyncSession, name: str
) -> Optional[DistilleryModel]:
    """
    Retrieve a single distillery by its name.
    """
    result = await db.execute(
        select(DistilleryModel).where(DistilleryModel.name == name)
    )
    return result.scalars().first()


async def get_distilleries(
    db: AsyncSession, skip: int = 0, limit: int = 100
) -> List[DistilleryModel]:
    """
    Retrieve a list of distilleries with pagination.
    """
    result = await db.execute(select(DistilleryModel).offset(skip).limit(limit))
    return list(result.scalars().all())


async def create_distillery(
    db: AsyncSession, distillery: DistilleryCreate
) -> DistilleryModel:
    """
    Create a new distillery.
    """
    db_distillery = DistilleryModel(**distillery.dict())
    db.add(db_distillery)
    await db.flush()
    await db.refresh(db_distillery)
    return db_distillery


async def update_distillery(
    db: AsyncSession, distillery_id: int, distillery_update_data: DistilleryUpdate
) -> Optional[DistilleryModel]:
    """
    Update an existing distillery by ID.
    """
    db_distillery = await get_distillery(db, distillery_id)
    if not db_distillery:
        return None

    update_data = distillery_update_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_distillery, key, value)

    await db.flush()
    await db.refresh(db_distillery)
    return db_distillery


async def delete_distillery(
    db: AsyncSession, distillery_id: int
) -> Optional[DistilleryModel]:
    """
    Delete a distillery.
    Note: Consider handling linked whiskeys (e.g., restrict delete or nullify).
    # TODO: what if whiskeys are linked to this distillery?
    # want to prevent deletion or handle it - set whiskey.distillery_id to null).
    """
    db_distillery = await get_distillery(db, distillery_id)
    if not db_distillery:
        return None

    await db.delete(db_distillery)
    await db.flush()
    return db_distillery
