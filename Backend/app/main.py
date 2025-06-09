from contextlib import asynccontextmanager
from typing import Any
from typing import AsyncGenerator
from typing import Dict

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.database import Base
from app.db.database import engine
from app.routers import auth
from app.routers import distilleries
from app.routers import tastings
from app.routers import users
from app.routers import whiskeys


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    Base.metadata.create_all(bind=engine)
    print("Application startup: database tables created")

    yield

    # Shutdown: here adding code that runs when closing the app
    print("Application shutdown: cleaning up resources")
    # close connections, clean resources
    # If necessary, you can add asynchronous calls here to close connections.


app = FastAPI(
    title="Whiskey Collection API",
    description="API for managing a whiskey collection and tastings",
    version="1.0.0",
    lifespan=lifespan,
)

origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:8000",
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
def read_root() -> Dict[str, Any]:
    return {
        "message": "Welcome to Whiskey Collection API!",
        "doc_hint": "Visit /docs for API documentation.",
    }
