from datetime import date
from typing import TYPE_CHECKING

from sqlalchemy import Boolean
from sqlalchemy import Date
from sqlalchemy import ForeignKey
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Text
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship

from app.db.database import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.user_whiskey import UserWhiskey


class Tasting(Base):
    __tablename__ = "tastings"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    user_whiskey_id: Mapped[int] = mapped_column(ForeignKey("user_whiskeys.id"))

    tasting_date: Mapped[date] = mapped_column(Date, index=True)
    rating: Mapped[int] = mapped_column(Integer)  # 1–10
    color_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    nose_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    palate_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    finish_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    water_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    personal_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    shared: Mapped[bool] = mapped_column(Boolean, default=False)
    setting: Mapped[str | None] = mapped_column(String, nullable=True)

    created_date: Mapped[date] = mapped_column(Date, default=date.today)
    updated_date: Mapped[date] = mapped_column(
        Date, default=date.today, onupdate=date.today
    )

    user: Mapped["User"] = relationship(back_populates="tastings")
    user_whiskey: Mapped["UserWhiskey"] = relationship(back_populates="tastings")

    def __repr__(self) -> str:
        return f"<Tasting(id={self.id}, rating={self.rating}, shared={self.shared})>"
