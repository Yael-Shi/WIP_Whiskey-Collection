from sqlalchemy import Boolean, Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func # For default created_date

from app.db.database import Base # Import Base from your database setup

class User(Base):
    """
    SQLAlchemy model for the User.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, index=True)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False) # Optional: if you need admin roles

    created_date = Column(DateTime(timezone=True), server_default=func.now())
    updated_date = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships (if any, e.g., a user has many whiskeys or tastings)
    whiskeys = relationship("Whiskey", back_populates="owner")
    tastings = relationship("Tasting", back_populates="owner")

    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}')>"
