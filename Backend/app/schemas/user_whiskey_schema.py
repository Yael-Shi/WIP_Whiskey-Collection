from datetime import date
from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.schemas.whiskey_schema import Whiskey


class UserWhiskeyBase(BaseModel):
    purchase_date: Optional[date] = None
    bottle_size_ml: Optional[int] = None
    bottle_status_percent: Optional[int] = 100
    is_favorite: Optional[bool] = False


class UserWhiskeyCreate(UserWhiskeyBase):
    whiskey_id: int


class UserWhiskeyUpdate(UserWhiskeyBase):
    pass


class UserWhiskey(UserWhiskeyBase):
    id: int
    user_id: int
    whiskey: Whiskey
    created_date: datetime
    updated_date: Optional[datetime]

    class Config:
        from_attributes = True
