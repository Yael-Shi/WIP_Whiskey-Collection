from datetime import date
from typing import Optional

from pydantic import BaseModel


class TastingBase(BaseModel):
    tasting_date: date
    rating: int
    color_notes: Optional[str] = None
    nose_notes: Optional[str] = None
    palate_notes: Optional[str] = None
    finish_notes: Optional[str] = None
    water_notes: Optional[str] = None
    personal_notes: Optional[str] = None
    shared: Optional[bool] = False
    setting: Optional[str] = None


class TastingCreate(TastingBase):
    user_whiskey_id: int


class TastingUpdate(BaseModel):
    """Schema for updating an existing tasting"""

    tasting_date: Optional[date] = None
    rating: Optional[int] = None
    color_notes: Optional[str] = None
    nose_notes: Optional[str] = None
    palate_notes: Optional[str] = None
    finish_notes: Optional[str] = None
    water_notes: Optional[str] = None
    personal_notes: Optional[str] = None
    shared: Optional[bool] = None
    setting: Optional[str] = None


class Tasting(TastingBase):
    """Schema for a complete tasting with id"""

    id: int
    user_id: int
    user_whiskey_id: int
    created_date: date
    updated_date: date

    class Config:
        """Configure Pydantic to work with ORM"""

        from_attributes = True
