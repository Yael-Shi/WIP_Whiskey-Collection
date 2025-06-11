from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.auth.auth import get_password_hash, verify_password
from app.models.user import User as UserModel
from app.schemas.user_schema import UserCreate as UserCreateSchema
from app.schemas.user_schema import UserUpdate as UserUpdateSchema


async def get_user(db: AsyncSession, user_id: int) -> Optional[UserModel]:
    """
    Retrieve a single user by their ID.
    """
    result = await db.execute(
        select(UserModel).where(UserModel.id == user_id).with_for_update()
    )
    return result.scalars().first()


async def get_user_by_email(db: AsyncSession, email: str) -> Optional[UserModel]:
    """
    Retrieve a single user by their email.
    """
    result = await db.execute(
        select(UserModel).where(UserModel.email == email).limit(1)
    )
    return result.scalars().first()


async def get_users(
    db: AsyncSession, skip: int = 0, limit: int = 100
) -> list[UserModel]:
    """
    Retrieve a list of users with pagination.
    """
    result = await db.execute(select(UserModel).offset(skip).limit(limit))
    return list(result.scalars().all())


async def create_user(db: AsyncSession, user: UserCreateSchema) -> UserModel:
    """
    Create a new user.
    Hashes the password before saving.
    """
    hashed_password = get_password_hash(user.password)
    db_user = UserModel(
        email=user.email,
        full_name=user.full_name,
        hashed_password=hashed_password,
        is_active=True,
    )
    db.add(db_user)
    await db.flush()
    await db.refresh(db_user)
    return db_user


async def authenticate_user(
    db: AsyncSession, email: str, password: str
) -> Optional[UserModel]:
    user = await get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


async def update_user(
    db: AsyncSession, user_id: int, user_update_data: UserUpdateSchema
) -> Optional[UserModel]:
    """
    Update an existing user's details.
    Handles password hashing if a new password is provided.
    """
    db_user = await get_user(db, user_id=user_id)
    if not db_user:
        return None

    update_data = user_update_data.dict(exclude_unset=True)

    if "password" in update_data and update_data["password"]:
        hashed_password = get_password_hash(update_data["password"])
        db_user.hashed_password = hashed_password
        del update_data["password"]

    for key, value in update_data.items():
        setattr(db_user, key, value)

    await db.flush()
    await db.refresh(db_user)
    return db_user


async def delete_user(db: AsyncSession, user_id: int) -> Optional[UserModel]:
    db_user = await get_user(db, user_id)
    if not db_user:
        return None  # Or raise an exception
    await db.delete(db_user)
    await db.flush()
    return db_user
