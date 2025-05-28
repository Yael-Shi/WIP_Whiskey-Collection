from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, Date, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime

from app.db.database import Base

class Tasting(Base):
    __tablename__ = "tastings"

    id = Column(Integer, primary_key=True, index=True)
    whiskey_id = Column(Integer, ForeignKey("whiskeys.id"))
    tasting_date = Column(Date, index=True)
    rating = Column(Integer)  # 1-10
    color_notes = Column(Text, nullable=True)
    nose_notes = Column(Text, nullable=True)
    palate_notes = Column(Text, nullable=True)
    finish_notes = Column(Text, nullable=True)
    water_notes = Column(Text, nullable=True)
    personal_notes = Column(Text, nullable=True)
    shared = Column(Boolean, default=False)
    setting = Column(String, nullable=True)
    
    created_date = Column(Date, default=datetime.now)
    updated_date = Column(Date, default=datetime.now, onupdate=datetime.now)
    
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="tastings")
    whiskey = relationship("Whiskey", back_populates="tastings")
