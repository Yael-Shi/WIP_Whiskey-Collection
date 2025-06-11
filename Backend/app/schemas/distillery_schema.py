from datetime import datetime
from typing import Optional

from pydantic import BaseModel
from pydantic import HttpUrl


class DistilleryBase(BaseModel):
    name: str
    region: Optional[str] = None
    country: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[HttpUrl] = None
    website: Optional[HttpUrl] = None
    is_active: Optional[bool] = True


class DistilleryCreate(DistilleryBase):
    pass


class DistilleryUpdate(BaseModel):
    name: Optional[str] = None
    region: Optional[str] = None
    country: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[HttpUrl] = None
    website: Optional[HttpUrl] = None
    is_active: Optional[bool] = None


class Distillery(DistilleryBase):
    id: int
    created_date: datetime
    updated_date: Optional[datetime] = None
    # whiskeys: List[Whiskey] = []
    # If you want to include whiskeys from this distillery in the response

    class Config:
        from_attributes = True

        orm_mode = True
