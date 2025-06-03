from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Database models for creating tables
from app.models import user, whiskey, tasting, distillery
# Database engine for table creation
from app.db.database import engine

# Import API routers to include their endpoints in the application
from app.routers import auth, whiskeys, tastings, users, distilleries

# Create database tables (SQLAlchemy Base.metadata.create_all)
user.Base.metadata.create_all(bind=engine)
whiskey.Base.metadata.create_all(bind=engine)
tasting.Base.metadata.create_all(bind=engine)
distillery.Base.metadata.create_all(bind=engine)

# Initialize the FastAPI application
app = FastAPI(
    title="Whiskey Collection API",
    description="API for managing a whiskey collection and tastings",
    version="1.0.0"
)

# Configure CORS (Cross-Origin Resource Sharing) middleware
# This allows requests from specified origins (e.g., your frontend)
origins = [
    "http://localhost",
    "http://localhost:3000",  # Frontend development server
    "http://localhost:8000",  # Backend server (if accessed directly)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all API routers into the main application
# Each router defines a set of related endpoints with a common prefix
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api", tags=["Users"])
app.include_router(whiskeys.router, prefix="/api", tags=["Whiskeys"])
app.include_router(tastings.router, prefix="/api", tags=["Tastings"])
app.include_router(distilleries.router, prefix="/api", tags=["Distilleries"])

# Define a root endpoint for a basic welcome message or API status
@app.get("/")
def read_root():
    return {"message": "Welcome to Whiskey Collection API! Visit /docs for API documentation."}

# All specific API endpoints (like /auth/register, /auth/token, /api/whiskeys, etc.)
# are defined within their respective router files (e.g., app/routers/auth.py, app/routers/whiskeys.py)
# and are implicitly added to the application via the app.include_router calls above.