from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base

if TYPE_CHECKING:
    from app.models.tasting import Tasting
    from app.models.user import User
    from app.models.whiskey import Whiskey


class UserWhiskey(Base):
    """
    Association table for many-to-many relationship between Users and Whiskeys.
    Stores user-specific data for each whiskey in their collection.
    """

    __tablename__ = "user_whiskeys"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    whiskey_id: Mapped[int] = mapped_column(ForeignKey("whiskeys.id"))
    is_owned: Mapped[bool] = mapped_column(Boolean, default=True)
    is_favorite: Mapped[bool] = mapped_column(Boolean, default=False)

    whiskey: Mapped["Whiskey"] = relationship(back_populates="user_whiskeys")
    user: Mapped["User"] = relationship(back_populates="user_whiskeys")
    tastings: Mapped[list["Tasting"]] = relationship(back_populates="user_whiskey")

    created_date: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_date: Mapped[datetime | None] = mapped_column(onupdate=func.now())

    def __repr__(self) -> str:
        return f"<UserWhiskey(user_id={self.user_id}, whiskey_id={self.whiskey_id})>"
