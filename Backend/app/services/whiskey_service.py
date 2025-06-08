from typing import List
from typing import Optional

from sqlalchemy.orm import Session

from app.models.whiskey import Whiskey as WhiskeyModel
from app.schemas.whiskey_schema import WhiskeyCreate as WhiskeyCreateSchema
from app.schemas.whiskey_schema import WhiskeyUpdate as WhiskeyUpdateSchema


def get_whiskey(db: Session, whiskey_id: int, owner_id: int) -> Optional[WhiskeyModel]:
    """
    Retrieve a single whiskey by its ID, ensuring it belongs to the owner.
    """
    return (
        db.query(WhiskeyModel)
        .filter(WhiskeyModel.id == whiskey_id, WhiskeyModel.owner_id == owner_id)
        .first()
    )


def get_whiskeys_by_owner(
    db: Session, owner_id: int, skip: int = 0, limit: int = 100
) -> List[WhiskeyModel]:
    """
    Retrieve a list of whiskeys for a specific owner with pagination.
    """
    return (
        db.query(WhiskeyModel)
        .filter(WhiskeyModel.owner_id == owner_id)
        .offset(skip)
        .limit(limit)
        .all()
    )


def create_whiskey(
    db: Session, whiskey: WhiskeyCreateSchema, owner_id: int
) -> WhiskeyModel:
    """
    Create a new whiskey for a specific owner.
    """
    db_whiskey = WhiskeyModel(**whiskey.dict(), owner_id=owner_id)
    db.add(db_whiskey)
    db.commit()
    db.refresh(db_whiskey)
    return db_whiskey


def update_whiskey(
    db: Session,
    whiskey_id: int,
    whiskey_update_data: WhiskeyUpdateSchema,
    owner_id: int,
) -> Optional[WhiskeyModel]:
    """
    Update an existing whiskey.
    """
    db_whiskey = get_whiskey(db, whiskey_id, owner_id)  # Ensure user owns the whiskey
    if not db_whiskey:
        return None  # Or raise HTTPException

    update_data = whiskey_update_data.dict(
        exclude_unset=True
    )  # exclude_unset ensures only provided fields are updated
    for key, value in update_data.items():
        setattr(db_whiskey, key, value)

    db.commit()
    db.refresh(db_whiskey)
    return db_whiskey


def delete_whiskey(
    db: Session, whiskey_id: int, owner_id: int
) -> Optional[WhiskeyModel]:
    """
    Delete a whiskey.
    """
    db_whiskey = get_whiskey(db, whiskey_id, owner_id)  # Ensure user owns the whiskey
    if not db_whiskey:
        return None  # Or raise HTTPException

    db.delete(db_whiskey)
    db.commit()
    return db_whiskey
