# flake8: noqa: E402
from dotenv import load_dotenv

load_dotenv()

import asyncio
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.db.database import init_db
from app.models import *
from app.routers import auth
from app.routers import distilleries
from app.routers import tastings
from app.routers import user_whiskey
from app.routers import users
from app.routers import whiskeys


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    print("Application startup: Starting database table creation...")
    await init_db()
    print("Application startup: Database tables created successfully.")
    yield


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
app.include_router(user_whiskey.router, prefix="/api", tags=["User Whiskey"])


@app.get("/")
async def read_root() -> JSONResponse:
    return JSONResponse(
        content={
            "message": "Welcome to Whiskey Collection API! "
            "Visit /docs for API documentation."
        }
    )
