from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel


class WhiskeyBase(BaseModel):
    """Base whiskey schema with common attributes"""
    name: str
    distillery: str
    region: Optional[str] = None
    age: Optional[int] = None
    type: Optional[str] = None
    abv: Optional[float] = None
    price: Optional[float] = None
    purchase_date: Optional[date] = None
    bottle_size_ml: Optional[int] = 700
    bottle_status_percent: Optional[int] = 100
    notes: Optional[str] = None
    image_url: Optional[str] = None
    is_favorite: Optional[bool] = False


class WhiskeyCreate(WhiskeyBase):
    """Schema for creating a new whiskey"""
    pass


class WhiskeyUpdate(BaseModel):
    """Schema for updating an existing whiskey"""
    name: Optional[str] = None
    distillery: Optional[str] = None
    region: Optional[str] = None
    age: Optional[int] = None
    type: Optional[str] = None
    abv: Optional[float] = None
    price: Optional[float] = None
    purchase_date: Optional[date] = None
    bottle_size_ml: Optional[int] = None
    bottle_status_percent: Optional[int] = None
    notes: Optional[str] = None
    image_url: Optional[str] = None
    is_favorite: Optional[bool] = None


class Whiskey(WhiskeyBase):
    """Schema for a complete whiskey with all attributes"""
    id: int
    owner_id: int
    created_date: datetime
    updated_date: Optional[datetime] = None

    class Config:
        """Configure Pydantic to parse obj to JSON"""
        from_attributes = True
