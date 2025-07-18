from typing import List
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user_whiskey import UserWhiskey as UserWhiskeyModel
from app.schemas.user_whiskey_schema import UserWhiskeyUpdate as WhiskeyUpdateSchema
from app.schemas.whiskey_schema import WhiskeyCreate as WhiskeyCreateSchema


async def get_user_whiskey(
    db: AsyncSession, user_whiskey_id: int, user_id: int
) -> Optional[UserWhiskeyModel]:
    """
    Retrieve a single UserWhiskey record by ID, ensuring it belongs to the user.
    """
    result = await db.execute(
        select(UserWhiskeyModel)
        .where(
            UserWhiskeyModel.id == user_whiskey_id,
            UserWhiskeyModel.user_id == user_id,
        )
        .with_for_update()
    )
    return result.scalars().first()


async def get_user_whiskeys(
    db: AsyncSession, user_id: int, skip: int = 0, limit: int = 100
) -> List[UserWhiskeyModel]:
    """
    Retrieve all whiskeys owned by a specific user.
    """
    result = await db.execute(
        select(UserWhiskeyModel)
        .where(UserWhiskeyModel.user_id == user_id)
        .offset(skip)
        .limit(limit)
    )
    return list(result.scalars().all())


async def create_user_whiskey(
    db: AsyncSession, whiskey: WhiskeyCreateSchema, user_id: int
) -> UserWhiskeyModel:
    """
    Create a new UserWhiskey instance for a specific user.
    """
    db_whiskey = UserWhiskeyModel(**whiskey.dict(), user_id=user_id)
    db.add(db_whiskey)
    await db.flush()
    await db.refresh(db_whiskey)
    return db_whiskey


async def update_user_whiskey(
    db: AsyncSession,
    user_whiskey_id: int,
    whiskey_update_data: WhiskeyUpdateSchema,
    user_id: int,
) -> Optional[UserWhiskeyModel]:
    """
    Update an existing UserWhiskey record.
    """
    db_whiskey = await get_user_whiskey(db, user_whiskey_id, user_id)
    if not db_whiskey:
        return None  # Or raise HTTPException

    update_data = whiskey_update_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_whiskey, key, value)

    await db.flush()
    await db.refresh(db_whiskey)
    return db_whiskey


async def delete_user_whiskey(
    db: AsyncSession, user_whiskey_id: int, user_id: int
) -> Optional[UserWhiskeyModel]:
    """
    Delete a UserWhiskey record.
    """
    db_whiskey = await get_user_whiskey(db, user_whiskey_id, user_id)
    if not db_whiskey:
        return None  # Or raise HTTPException

    await db.delete(db_whiskey)
    await db.flush()
    return db_whiskey
