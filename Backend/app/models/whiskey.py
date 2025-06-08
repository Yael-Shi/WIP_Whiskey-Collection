from sqlalchemy import Boolean
from sqlalchemy import Column
from sqlalchemy import Date
from sqlalchemy import DateTime
from sqlalchemy import Float
from sqlalchemy import ForeignKey
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class Whiskey(Base):
    __tablename__ = "whiskeys"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    distillery = Column(String)
    region = Column(String)
    age = Column(Integer, nullable=True)
    type = Column(String)  # e.g., Single Malt, Bourbon
    abv = Column(Float, nullable=True)  # Alcohol By Volume
    price = Column(Float, nullable=True)
    purchase_date = Column(Date, nullable=True)
    bottle_size_ml = Column(Integer, nullable=True)
    bottle_status_percent = Column(Integer, default=100)  # 0-100%
    notes = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    is_favorite = Column(Boolean, default=False)

    owner_id = Column(Integer, ForeignKey("users.id"))  # Foreign key to users table

    owner = relationship(
        "User", back_populates="whiskeys"
    )  # Relationship to User model
    tastings = relationship(
        "Tasting", back_populates="whiskey_info", cascade="all, delete-orphan"
    )

    created_date = Column(DateTime(timezone=True), server_default=func.now())
    updated_date = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Whiskey(id={self.id}, name='{self.name}')>"
