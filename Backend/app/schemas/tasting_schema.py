from datetime import date
from typing import Optional

from pydantic import BaseModel


class TastingBase(BaseModel):
    """Base Tasting schema with common attributes"""

    whiskey_id: int
    rating: int
    tasting_date: date
    color_notes: Optional[str] = None
    nose_notes: Optional[str] = None
    palate_notes: Optional[str] = None
    finish_notes: Optional[str] = None
    water_notes: Optional[str] = None
    personal_notes: Optional[str] = None
    shared: Optional[bool] = False
    setting: Optional[str] = None


class TastingCreate(TastingBase):
    """Schema for creating a new tasting"""

    pass


class TastingUpdate(BaseModel):
    """Schema for updating an existing tasting"""

    rating: Optional[int] = None
    tasting_date: Optional[date] = None
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
    created_date: date

    class Config:
        """Configure Pydantic to work with ORM"""

        from_attributes = True
