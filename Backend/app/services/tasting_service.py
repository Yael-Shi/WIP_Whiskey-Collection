from typing import List
from typing import Optional

from sqlalchemy.orm import Session

from app.models.tasting import Tasting as TastingModel
from app.schemas.tasting_schema import TastingCreate as TastingCreateSchema
from app.schemas.tasting_schema import TastingUpdate as TastingUpdateSchema


def get_tasting(db: Session, tasting_id: int, user_id: int) -> Optional[TastingModel]:
    """
    Retrieve a single tasting by its ID, ensuring it belongs to the user.
    """
    return (
        db.query(TastingModel)
        .filter(TastingModel.id == tasting_id, TastingModel.user_id == user_id)
        .first()
    )


def get_tastings_by_user(
    db: Session, user_id: int, skip: int = 0, limit: int = 100
) -> List[TastingModel]:
    """
    Retrieve a list of tastings for a specific user with pagination.
    """
    return (
        db.query(TastingModel)
        .filter(TastingModel.user_id == user_id)
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_tastings_by_whiskey(
    db: Session, whiskey_id: int, user_id: int, skip: int = 0, limit: int = 100
) -> List[TastingModel]:
    """
    Retrieve tastings for a specific whiskey and user.
    """
    return (
        db.query(TastingModel)
        .filter(TastingModel.whiskey_id == whiskey_id, TastingModel.user_id == user_id)
        .offset(skip)
        .limit(limit)
        .all()
    )


def create_tasting(
    db: Session, tasting: TastingCreateSchema, user_id: int
) -> TastingModel:
    """
    Create a new tasting for a specific user.
    The whiskey_id is part of the TastingCreateSchema.
    """
    db_tasting = TastingModel(**tasting.dict(), user_id=user_id)
    db.add(db_tasting)
    db.commit()
    db.refresh(db_tasting)
    return db_tasting


def update_tasting(
    db: Session, tasting_id: int, tasting_update_data: TastingUpdateSchema, user_id: int
) -> Optional[TastingModel]:
    """
    Update an existing tasting.
    """
    db_tasting = get_tasting(db, tasting_id, user_id)  # Ensure user owns the tasting
    if not db_tasting:
        return None  # Or raise HTTPException

    update_data = tasting_update_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_tasting, key, value)

    db.commit()
    db.refresh(db_tasting)
    return db_tasting


def delete_tasting(
    db: Session, tasting_id: int, user_id: int
) -> Optional[TastingModel]:
    """
    Delete a tasting.
    """
    db_tasting = get_tasting(db, tasting_id, user_id)  # Ensure user owns the tasting
    if not db_tasting:
        return None  # Or raise HTTPException

    db.delete(db_tasting)
    db.commit()
    return db_tasting
