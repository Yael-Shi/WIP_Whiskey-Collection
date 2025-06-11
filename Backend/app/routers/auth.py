from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.auth import create_access_token, get_current_active_user
from app.db.database import get_db
from app.schemas import user_schema
from app.services.user_service import authenticate_user
from app.services.user_service import create_user as user_service_create_user
from app.services.user_service import get_user_by_email

router = APIRouter()


@router.post("/token", response_model=user_schema.Token, tags=["Authentication"])
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
) -> dict[str, str]:
    """
    Authenticate user and return JWT access token.
    Requires username (email) and password.
    """
    user = await authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="שם משתמש או סיסמה שגויים",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}


@router.post(
    "/register",
    response_model=user_schema.User,
    status_code=status.HTTP_201_CREATED,
    tags=["Authentication"],
)
async def register_user(
    user: user_schema.UserCreate, db: AsyncSession = Depends(get_db)
) -> user_schema.User:
    """
    Register a new user.
    Email must be unique.
    """
    db_user = await get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="האימייל כבר רשום במערכת")
    new_user = await user_service_create_user(db=db, user=user)
    return new_user


@router.get("/users/me", response_model=user_schema.User, tags=["Users"])
async def read_users_me(
    current_user: user_schema.User = Depends(get_current_active_user),
) -> user_schema.User:
    """
    Retrieve the current authenticated user's details.
    Requires a valid JWT token.
    """
    return current_user
