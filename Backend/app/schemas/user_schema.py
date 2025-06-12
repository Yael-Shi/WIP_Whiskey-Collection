from datetime import datetime
from typing import Optional

from pydantic import BaseModel
from pydantic import EmailStr


class UserBase(BaseModel):
    """Base user schema with common attributes"""

    email: EmailStr
    full_name: Optional[str] = None
    is_active: Optional[bool] = True


class UserCreate(UserBase):
    """Schema for creating a new user"""

    password: str


class UserUpdate(BaseModel):
    """Schema for updating an existing user"""

    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = None


class User(UserBase):
    """Schema for a complete user with all attributes"""

    id: int
    created_date: datetime

    class Config:
        """Configure Pydantic to parse obj to JSON"""

        from_attributes = True
        from_attributes = True


class Token(BaseModel):
    """Schema for JWT token"""

    access_token: str
    token_type: str


class TokenData(BaseModel):
    """Schema for JWT token payload"""

    email: Optional[str] = None
