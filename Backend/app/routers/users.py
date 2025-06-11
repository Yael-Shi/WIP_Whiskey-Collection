from typing import List

from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from fastapi import status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session

from app.auth.auth import (
    get_current_active_user,  # , get_current_active_superuser
    # Optional for admin routes
)
from app.db.database import get_db
from app.models.user import User as UserModel
from app.schemas.user_schema import User as UserSchema
from app.schemas.user_schema import UserUpdate as UserUpdateSchema
from app.services import user_service  # Assuming you have a user_service.py

router = APIRouter()

# TODO Some of endpoints might be admin-only in a real application,
# will need use a dependency like `get_current_active_superuser` for those.


@router.get("/users/", response_model=List[UserSchema])
async def read_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    # current_user: UserModel = Depends(get_current_active_superuser)
    # Example for admin-only
    current_user: UserModel = Depends(
        get_current_active_user
    ),  # For now, allow any active user to see all users
):
    """
    Retrieve all users.
    Consider making this an admin-only endpoint in a production environment.
    """
    users = await user_service.get_users(db, skip=skip, limit=limit)
    return users


@router.get("/users/{user_id}", response_model=UserSchema)
async def read_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user),
) -> UserSchema:
    """
    Retrieve a specific user by ID.
    A user might only be allowed to retrieve their own info,
    or an admin can retrieve any.
    """
    # Basic authorization: allow user to get their own info, or admin to get any.
    # if current_user.id != user_id and not current_user.is_superuser:
    #     raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
    # detail="Not authorized to access this user")
    db_user = await user_service.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    return db_user


@router.put("/users/me", response_model=UserSchema)
async def update_current_user_me(
    user_update: UserUpdateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user),
) -> UserSchema:
    """
    Update the current logged-in user's information.
    """
    updated_user = await user_service.update_user(
        db, user_id=current_user.id, user_update_data=user_update
    )
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found for update"
        )
    return updated_user


@router.put(
    "/users/{user_id}", response_model=UserSchema
)  # More general update, potentially for admins
async def update_specific_user(
    user_id: int,
    user_update: UserUpdateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(
        get_current_active_user
    ),  # Or get_current_active_superuser
) -> UserSchema:
    """
    Update a specific user's information.
    Consider making this an admin-only endpoint.
    """
    # Add authorization checks here if needed (e.g., only admin can update other users)
    # if not current_user.is_superuser:
    #     raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
    # detail="Not authorized to update this user")
    updated_user = await user_service.update_user(
        db, user_id=user_id, user_update_data=user_update
    )
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found for update"
        )
    return updated_user
