from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List, Optional

from app.models import user, whiskey, tasting
from app.db.database import get_db, engine

from app.schemas import user_schema, whiskey_schema, tasting_schema
from app.services import user_service, whiskey_service, ai_service
from app.auth.auth import get_current_active_user, create_access_token
from app.routers import auth, whiskeys, tastings, users, distilleries
from app.models import user, whiskey, tasting, distillery

# Create database tables
user.Base.metadata.create_all(bind=engine)
whiskey.Base.metadata.create_all(bind=engine)
tasting.Base.metadata.create_all(bind=engine)
distillery.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Whiskey Collection API",
    description="API for managing a whiskey collection and tastings",
    version="1.0.0"
)

# Configure CORS
origins = [
    "http://localhost",
    "http://localhost:3000",  # React default port
    "http://localhost:8000",  # FastAPI default port
    # Add more origins as needed
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api", tags=["Users"])
app.include_router(whiskeys.router, prefix="/api", tags=["Whiskeys"])
app.include_router(tastings.router, prefix="/api", tags=["Tastings"])
app.include_router(distilleries.router, prefix="/api", tags=["Distilleries"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Whiskey Collection API! Visit /docs for API documentation."}

# Auth routes
@app.post("/token", response_model=user_schema.Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = user_service.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="שם משתמש או סיסמה שגויים",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

# User routes
@app.post("/users/", response_model=user_schema.User)
def create_user(user: user_schema.UserCreate, db: Session = Depends(get_db)):
    db_user = user_service.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="האימייל כבר רשום")
    return user_service.create_user(db=db, user=user)

@app.get("/users/me/", response_model=user_schema.User)
async def read_users_me(current_user: user_schema.User = Depends(get_current_active_user)):
    return current_user

# Whiskey routes
@app.post("/whiskeys/", response_model=whiskey_schema.Whiskey)
def create_whiskey(
    whiskey: whiskey_schema.WhiskeyCreate,
    db: Session = Depends(get_db),
    current_user: user_schema.User = Depends(get_current_active_user)
):
    return whiskey_service.create_whiskey(db=db, whiskey=whiskey, user_id=current_user.id)

@app.get("/whiskeys/", response_model=List[whiskey_schema.Whiskey])
def read_whiskeys(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: user_schema.User = Depends(get_current_active_user)
):
    whiskeys = whiskey_service.get_whiskeys(db, user_id=current_user.id, skip=skip, limit=limit)
    return whiskeys

@app.get("/whiskeys/{whiskey_id}", response_model=whiskey_schema.Whiskey)
def read_whiskey(
    whiskey_id: int, 
    db: Session = Depends(get_db),
    current_user: user_schema.User = Depends(get_current_active_user)
):
    db_whiskey = whiskey_service.get_whiskey(db, whiskey_id=whiskey_id, user_id=current_user.id)
    if db_whiskey is None:
        raise HTTPException(status_code=404, detail="ויסקי לא נמצא")
    return db_whiskey

@app.put("/whiskeys/{whiskey_id}", response_model=whiskey_schema.Whiskey)
def update_whiskey(
    whiskey_id: int,
    whiskey: whiskey_schema.WhiskeyUpdate,
    db: Session = Depends(get_db),
    current_user: user_schema.User = Depends(get_current_active_user)
):
    db_whiskey = whiskey_service.update_whiskey(db=db, whiskey_id=whiskey_id, whiskey=whiskey, user_id=current_user.id)
    if db_whiskey is None:
        raise HTTPException(status_code=404, detail="ויסקי לא נמצא")
    return db_whiskey

@app.delete("/whiskeys/{whiskey_id}", response_model=bool)
def delete_whiskey(
    whiskey_id: int,
    db: Session = Depends(get_db),
    current_user: user_schema.User = Depends(get_current_active_user)
):
    result = whiskey_service.delete_whiskey(db=db, whiskey_id=whiskey_id, user_id=current_user.id)
    if not result:
        raise HTTPException(status_code=404, detail="ויסקי לא נמצא")
    return result

# Tasting routes
@app.post("/tastings/", response_model=tasting_schema.Tasting)
def create_tasting(
    tasting: tasting_schema.TastingCreate,
    db: Session = Depends(get_db),
    current_user: user_schema.User = Depends(get_current_active_user)
):
    # Verify the whiskey belongs to the user
    whiskey = whiskey_service.get_whiskey(db, whiskey_id=tasting.whiskey_id, user_id=current_user.id)
    if not whiskey:
        raise HTTPException(status_code=404, detail="ויסקי לא נמצא")
    return whiskey_service.create_tasting(db=db, tasting=tasting, user_id=current_user.id)

@app.get("/tastings/", response_model=List[tasting_schema.Tasting])
def read_tastings(
    whiskey_id: Optional[int] = None,
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: user_schema.User = Depends(get_current_active_user)
):
    tastings = whiskey_service.get_tastings(db, user_id=current_user.id, whiskey_id=whiskey_id, skip=skip, limit=limit)
    return tastings

@app.get("/tastings/{tasting_id}", response_model=tasting_schema.Tasting)
def read_tasting(
    tasting_id: int, 
    db: Session = Depends(get_db),
    current_user: user_schema.User = Depends(get_current_active_user)
):
    tasting = whiskey_service.get_tasting(db, tasting_id=tasting_id, user_id=current_user.id)
    if tasting is None:
        raise HTTPException(status_code=404, detail="טעימה לא נמצאה")
    return tasting

@app.put("/tastings/{tasting_id}", response_model=tasting_schema.Tasting)
def update_tasting(
    tasting_id: int,
    tasting: tasting_schema.TastingUpdate,
    db: Session = Depends(get_db),
    current_user: user_schema.User = Depends(get_current_active_user)
):
    db_tasting = whiskey_service.update_tasting(db=db, tasting_id=tasting_id, tasting=tasting, user_id=current_user.id)
    if db_tasting is None:
        raise HTTPException(status_code=404, detail="טעימה לא נמצאה")
    return db_tasting

@app.delete("/tastings/{tasting_id}", response_model=bool)
def delete_tasting(
    tasting_id: int,
    db: Session = Depends(get_db),
    current_user: user_schema.User = Depends(get_current_active_user)
):
    result = whiskey_service.delete_tasting(db=db, tasting_id=tasting_id, user_id=current_user.id)
    if not result:
        raise HTTPException(status_code=404, detail="טעימה לא נמצאה")
    return result

# AI routes
@app.get("/ai/search_whiskey/{query}")
def search_whiskey(
    query: str,
    current_user: user_schema.User = Depends(get_current_active_user)
):
    return ai_service.search_whiskey_info(query)

@app.get("/ai/analyze_collection")
def analyze_collection(
    db: Session = Depends(get_db),
    current_user: user_schema.User = Depends(get_current_active_user)
):
    whiskeys = whiskey_service.get_whiskeys(db, user_id=current_user.id)
    tastings = whiskey_service.get_tastings(db, user_id=current_user.id)
    return ai_service.analyze_collection(whiskeys, tastings)

@app.get("/ai/recommend_whiskey")
def recommend_whiskey(
    db: Session = Depends(get_db),
    current_user: user_schema.User = Depends(get_current_active_user)
):
    whiskeys = whiskey_service.get_whiskeys(db, user_id=current_user.id)
    tastings = whiskey_service.get_tastings(db, user_id=current_user.id)
    return ai_service.recommend_whiskey(whiskeys, tastings)