from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from fastapi import status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.auth.auth import create_access_token
from app.auth.auth import get_current_active_user
from app.db.database import get_db
from app.schemas import user_schema
from app.services.user_service import authenticate_user
from app.services.user_service import create_user as user_service_create_user
from app.services.user_service import get_user_by_email

router = APIRouter()


@router.post("/token", response_model=user_schema.Token, tags=["Authentication"])
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    """
    Authenticate user and return JWT access token.
    Requires username (email) and password.
    """
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="שם משתמש או סיסמה שגויים",
            headers={"WWW-Authenticate": "Bearer"},
        )
    # If user is authenticated, create an access token
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}


@router.post(
    "/register",
    response_model=user_schema.User,
    status_code=status.HTTP_201_CREATED,
    tags=["Authentication"],
)
def register_user(user: user_schema.UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user.
    Email must be unique.
    """
    # Check if a user with this email already exists
    db_user = get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="האימייל כבר רשום במערכת")

    # Create the new user
    new_user = user_service_create_user(db=db, user=user)
    return new_user


@router.get("/users/me", response_model=user_schema.User, tags=["Users"])
async def read_users_me(
    current_user: user_schema.User = Depends(get_current_active_user),
):
    """
    Retrieve the current authenticated user's details.
    Requires a valid JWT token.
    """
    return current_user
