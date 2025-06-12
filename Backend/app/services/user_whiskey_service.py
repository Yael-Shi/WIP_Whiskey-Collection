from typing import List
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user_whiskey import UserWhiskey as UserWhiskeyModel
from app.schemas.user_whiskey_schema import UserWhiskeyCreate as UserWhiskeyCreateSchema
from app.schemas.user_whiskey_schema import UserWhiskeyUpdate as UserWhiskeyUpdateSchema


async def get_user_whiskey(
    db: AsyncSession, user_whiskey_id: int, user_id: int
) -> Optional[UserWhiskeyModel]:
    """
    Retrieve a specific UserWhiskey instance by ID, ensuring it belongs to the user.
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
    Retrieve all UserWhiskey entries belonging to the current user.
    """
    result = await db.execute(
        select(UserWhiskeyModel)
        .where(UserWhiskeyModel.user_id == user_id)
        .offset(skip)
        .limit(limit)
    )
    return list(result.scalars().all())


async def create_user_whiskey(
    db: AsyncSession, user_id: int, user_whiskey: UserWhiskeyCreateSchema
) -> UserWhiskeyModel:
    """
    Create a new UserWhiskey entry for the current user.
    """
    db_user_whiskey = UserWhiskeyModel(**user_whiskey.dict(), user_id=user_id)
    db.add(db_user_whiskey)
    await db.flush()
    await db.refresh(db_user_whiskey)
    return db_user_whiskey


async def update_user_whiskey(
    db: AsyncSession,
    user_whiskey_id: int,
    user_id: int,
    update_data: UserWhiskeyUpdateSchema,
) -> Optional[UserWhiskeyModel]:
    """
    Update an existing UserWhiskey entry.
    """
    db_user_whiskey = await get_user_whiskey(db, user_whiskey_id, user_id)
    if not db_user_whiskey:
        return None

    for key, value in update_data.dict(exclude_unset=True).items():
        setattr(db_user_whiskey, key, value)

    await db.flush()
    await db.refresh(db_user_whiskey)
    return db_user_whiskey


async def delete_user_whiskey(
    db: AsyncSession, user_whiskey_id: int, user_id: int
) -> Optional[UserWhiskeyModel]:
    """
    Delete a specific UserWhiskey instance.
    """
    db_user_whiskey = await get_user_whiskey(db, user_whiskey_id, user_id)
    if not db_user_whiskey:
        return None

    await db.delete(db_user_whiskey)
    await db.flush()
    return db_user_whiskey
