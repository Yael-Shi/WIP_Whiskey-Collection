from datetime import date
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean
from sqlalchemy import Date
from sqlalchemy import DateTime
from sqlalchemy import Float
from sqlalchemy import ForeignKey
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base

if TYPE_CHECKING:
    from app.models.distillery import Distillery
    from app.models.user_whiskey import UserWhiskey


class Whiskey(Base):
    __tablename__ = "whiskeys"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, index=True, nullable=False)
    distillery_id: Mapped[int | None] = mapped_column(
        ForeignKey("distilleries.id"), nullable=True
    )
    region: Mapped[str | None] = mapped_column(String, nullable=True)
    age: Mapped[int | None] = mapped_column(Integer, nullable=True)
    type: Mapped[str | None] = mapped_column(
        String, nullable=True
    )  # e.g., Single Malt, Bourbon
    abv: Mapped[float | None] = mapped_column(Float, nullable=True)  # Alcohol By Volume
    price: Mapped[float | None] = mapped_column(Float, nullable=True)
    purchase_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    bottle_size_ml: Mapped[int | None] = mapped_column(Integer, nullable=True)
    bottle_status_percent: Mapped[int] = mapped_column(Integer, default=100)  # 0-100%
    notes: Mapped[str | None] = mapped_column(String, nullable=True)
    image_url: Mapped[str | None] = mapped_column(String, nullable=True)
    is_favorite: Mapped[bool] = mapped_column(Boolean, default=False)

    distillery_info: Mapped["Distillery"] = relationship(back_populates="whiskeys")
    user_whiskeys: Mapped[list["UserWhiskey"]] = relationship(back_populates="whiskey")

    created_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_date: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), onupdate=func.now()
    )

    def __repr__(self) -> str:
        return f"<Whiskey(id={self.id}, name='{self.name}')>"
