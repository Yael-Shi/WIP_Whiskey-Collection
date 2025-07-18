from typing import List

from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from fastapi import status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.auth import get_current_active_user
from app.db.database import get_db
from app.models.distillery import Distillery as DistilleryModel
from app.schemas.distillery_schema import Distillery as DistillerySchema
from app.schemas.distillery_schema import DistilleryCreate
from app.schemas.distillery_schema import DistilleryUpdate
from app.services import distillery_service

# from app.auth.auth import get_current_active_superuser
# ^ If some actions are admin-only

router = APIRouter()


@router.post(
    "/distilleries/",
    response_model=DistillerySchema,
    status_code=status.HTTP_201_CREATED,
)
async def create_new_distillery(
    distillery: DistilleryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user),  # Protect this route
    # current_user: dict = Depends(get_current_active_superuser) # Or make it admin-only
) -> DistilleryModel:
    """
    Create a new distillery.
    """
    db_distillery_by_name = await distillery_service.get_distillery_by_name(
        db, name=distillery.name
    )
    if db_distillery_by_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Distillery with name '{distillery.name}' already exists.",
        )
    return await distillery_service.create_distillery(db=db, distillery=distillery)


@router.get("/distilleries/", response_model=List[DistillerySchema])
async def read_all_distilleries(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    # No auth needed for reading list of distilleries by default, but you can add it:
    # current_user: dict = Depends(get_current_active_user)
) -> List[DistilleryModel]:
    """
    Retrieve all distilleries.
    """
    distilleries = await distillery_service.get_distilleries(db, skip=skip, limit=limit)
    return distilleries


@router.get("/distilleries/{distillery_id}", response_model=DistillerySchema)
async def read_single_distillery(
    distillery_id: int,
    db: AsyncSession = Depends(get_db),
    # current_user: dict = Depends(get_current_active_user) # Optional auth
) -> DistilleryModel:
    """
    Retrieve a specific distillery by ID.
    """
    db_distillery = await distillery_service.get_distillery(
        db, distillery_id=distillery_id
    )
    if db_distillery is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Distillery not found"
        )
    return db_distillery


@router.put("/distilleries/{distillery_id}", response_model=DistillerySchema)
async def update_existing_distillery(
    distillery_id: int,
    distillery_update: DistilleryUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user),  # Protect this route
    # current_user: dict = Depends(get_current_active_superuser) # Or make it admin-only
) -> DistilleryModel:
    """
    Update a distillery by ID.
    """
    updated_distillery = await distillery_service.update_distillery(
        db, distillery_id=distillery_id, distillery_update_data=distillery_update
    )
    if updated_distillery is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Distillery not found"
        )
    return updated_distillery


@router.delete("/distilleries/{distillery_id}", response_model=DistillerySchema)
async def delete_existing_distillery(
    distillery_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user),  # Protect this route
    # current_user: dict = Depends(get_current_active_superuser) # Or make it admin-only
) -> DistilleryModel:
    """
    Delete a distillery by ID.
    """
    deleted_distillery = await distillery_service.delete_distillery(
        db, distillery_id=distillery_id
    )
    if deleted_distillery is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Distillery not found"
        )
    return deleted_distillery
