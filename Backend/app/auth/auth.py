from datetime import datetime, timedelta
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session


from app.db.database import get_db
from app.models.user import User as UserModel # Renamed to avoid conflict with User in schemas
from app.schemas.user_schema import TokenData

# Security constants
SECRET_KEY = "YOUR_SECRET_KEY_HERE"  # In production, use a secure key and store in environment variables #todo
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme setup
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")


def verify_password(plain_password, hashed_password):
    """Verify a password against a hash"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    """Hash a password for storing"""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT access token"""
    to_encode = data.copy()
    
    # Set expiration time
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Get the current user from the JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Decode the JWT token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    
    # Find the user in the database
    user = db.query(UserModel).filter(UserModel.email == token_data.email).first()
    if user is None:
        raise credentials_exception
    
    return user


async def get_current_active_user(current_user: UserModel = Depends(get_current_user)):
    """Ensure the user is active"""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user
