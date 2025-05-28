from sqlalchemy.orm import Session
from typing import List, Optional

from app.models.distillery import Distillery as DistilleryModel
from app.schemas.distillery_schema import DistilleryCreate, DistilleryUpdate

def get_distillery(db: Session, distillery_id: int) -> Optional[DistilleryModel]:
    return db.query(DistilleryModel).filter(DistilleryModel.id == distillery_id).first()

def get_distillery_by_name(db: Session, name: str) -> Optional[DistilleryModel]:
    return db.query(DistilleryModel).filter(DistilleryModel.name == name).first()

def get_distilleries(db: Session, skip: int = 0, limit: int = 100) -> List[DistilleryModel]:
    return db.query(DistilleryModel).offset(skip).limit(limit).all()

def create_distillery(db: Session, distillery: DistilleryCreate) -> DistilleryModel:
    db_distillery = DistilleryModel(**distillery.dict())
    db.add(db_distillery)
    db.commit()
    db.refresh(db_distillery)
    return db_distillery

def update_distillery(db: Session, distillery_id: int, distillery_update_data: DistilleryUpdate) -> Optional[DistilleryModel]:
    db_distillery = get_distillery(db, distillery_id)
    if not db_distillery:
        return None
    update_data = distillery_update_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_distillery, key, value)
    db.commit()
    db.refresh(db_distillery)
    return db_distillery

def delete_distillery(db: Session, distillery_id: int) -> Optional[DistilleryModel]:
    db_distillery = get_distillery(db, distillery_id)
    if not db_distillery:
        return None
    # Consider what happens if whiskeys are linked to this distillery.
    # You might want to prevent deletion or handle it (e.g., set whiskey.distillery_id to null).
    db.delete(db_distillery)
    db.commit()
    return db_distillery
