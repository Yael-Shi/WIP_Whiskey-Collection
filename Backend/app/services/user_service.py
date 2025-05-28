from sqlalchemy.orm import Session
from typing import Optional

from app.models.user import User as UserModel
from app.schemas.user_schema import UserCreate as UserCreateSchema
from app.schemas.user_schema import UserUpdate as UserUpdateSchema #todo - can I put this and the above on one line?
from app.auth.auth import get_password_hash # Import password hashing utility

def get_user(db: Session, user_id: int):
    """
    Retrieve a single user by their ID.
    """
    return db.query(UserModel).filter(UserModel.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    """
    Retrieve a single user by their email.
    """
    return db.query(UserModel).filter(UserModel.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    """
    Retrieve a list of users with pagination.
    """
    return db.query(UserModel).offset(skip).limit(limit).all()

def create_user(db: Session, user: UserCreateSchema):
    """
    Create a new user.
    Hashes the password before saving.
    """
    hashed_password = get_password_hash(user.password)
    db_user = UserModel(
        email=user.email,
        full_name=user.full_name,
        hashed_password=hashed_password,
        is_active=user.is_active # if is_active is part of UserCreateSchema
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user_update_data: UserUpdateSchema) -> Optional[UserModel]: #todo
    db_user = get_user(db, user_id=user_id)
    if not db_user:
        return None

    update_data = user_update_data.dict(exclude_unset=True)

    if "password" in update_data and update_data["password"]:
        hashed_password = get_password_hash(update_data["password"])
        db_user.hashed_password = hashed_password
        del update_data["password"]  # Don't try to set plain password directly

    for key, value in update_data.items():
        setattr(db_user, key, value)

    db.commit()
    db.refresh(db_user)
    return db_user


# You can add update_user and delete_user functions here later if needed.
# For example:
# def delete_user(db: Session, user_id: int):
#     db_user = get_user(db, user_id)
#     if not db_user:
#         return None # Or raise an exception
#     db.delete(db_user)
#     db.commit()
#     return db_user