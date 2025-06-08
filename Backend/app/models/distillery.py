from sqlalchemy import Boolean
from sqlalchemy import Column
from sqlalchemy import DateTime
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Text

# from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class Distillery(Base):
    __tablename__ = "distilleries"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, unique=True, nullable=False)
    region = Column(String, nullable=True)
    country = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    image_url = Column(String, nullable=True)
    website = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)  # Is the distillery still operational?

    # Relationship: A distillery can produce many whiskeys (one-to-many)
    # whiskeys = relationship("Whiskey", back_populates="distillery_info")
    # ^ You'd need to add 'distillery_info' to Whiskey model

    created_date = Column(DateTime(timezone=True), server_default=func.now())
    updated_date = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Distillery(id={self.id}, name='{self.name}')>"
