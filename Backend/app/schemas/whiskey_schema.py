from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class WhiskeyBase(BaseModel):
    """Base whiskey schema with common attributes"""

    name: str
    distillery: Optional[str] = None
    region: Optional[str] = None
    age: Optional[int] = None
    type: Optional[str] = None
    abv: Optional[float] = None
    price: Optional[float] = None
    notes: Optional[str] = None
    image_url: Optional[str] = None


class WhiskeyCreate(WhiskeyBase):
    """Schema for creating a new whiskey"""

    pass


class Whiskey(WhiskeyBase):
    """Schema for a complete whiskey with all attributes"""

    id: int
    created_date: datetime
    updated_date: Optional[datetime]

    class Config:
        """Configure Pydantic to parse obj to JSON"""

        from_attributes = True
