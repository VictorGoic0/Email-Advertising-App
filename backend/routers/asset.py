"""Asset router for file upload and management."""
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel, Field, field_validator
import logging

from database import get_db
from dependencies import get_current_user
from models.user import User
from models.asset import Asset
from schemas.asset import AssetResponse, AssetUpdate
from services.s3_service import s3_service
from services.categorization_service import categorize_asset
from services.openai_service import openai_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/assets", tags=["assets"])


@router.post("/upload", response_model=AssetResponse, status_code=status.HTTP_201_CREATED)
async def upload_asset(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload an asset file to S3 and create asset record.
    
    Args:
        file: Uploaded file
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        AssetResponse: Created asset with metadata
        
    Raises:
        HTTPException: 400 if file is invalid, 500 if upload fails
    """
    try:
        # Read file content
        file_content = await file.read()
        file_size = len(file_content)
        
        # Validate file size (e.g., max 10MB)
        max_size = 10 * 1024 * 1024  # 10MB
        if file_size > max_size:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File size exceeds maximum allowed size of {max_size / (1024 * 1024)}MB"
            )
        
        # Upload to S3
        s3_key, s3_url = s3_service.upload_file(
            file_content=file_content,
            filename=file.filename,
            user_id=current_user.id,
            content_type=file.content_type
        )
        
        # Categorize asset
        category, categorization_method = categorize_asset(
            filename=file.filename,
            file_type=file.content_type or "application/octet-stream"
        )
        
        # Create asset record in database
        asset = Asset(
            user_id=current_user.id,
            filename=file.filename,
            s3_key=s3_key,
            s3_url=s3_url,
            file_type=file.content_type or "application/octet-stream",
            file_size_bytes=file_size,
            category=category,
            categorization_method=categorization_method
        )
        
        db.add(asset)
        db.commit()
        db.refresh(asset)
        
        return asset
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload asset: {str(e)}"
        )


@router.get("", response_model=List[AssetResponse])
async def get_assets(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all assets for the current user.
    
    Args:
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        List of AssetResponse objects
    """
    assets = db.query(Asset).filter(Asset.user_id == current_user.id).all()
    return assets


@router.get("/{asset_id}", response_model=AssetResponse)
async def get_asset(
    asset_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific asset by ID.
    
    Args:
        asset_id: ID of the asset
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        AssetResponse: Asset details
        
    Raises:
        HTTPException: 404 if asset not found, 403 if asset belongs to different user
    """
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found"
        )
    
    if asset.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this asset"
        )
    
    return asset


@router.delete("/{asset_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_asset(
    asset_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete an asset from S3 and database.
    
    Args:
        asset_id: ID of the asset to delete
        current_user: Current authenticated user
        db: Database session
        
    Raises:
        HTTPException: 404 if asset not found, 403 if asset belongs to different user, 500 if deletion fails
    """
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found"
        )
    
    if asset.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this asset"
        )
    
    try:
        # Delete file from S3
        s3_service.delete_file(asset.s3_key)
        
        # Delete asset record from database
        db.delete(asset)
        db.commit()
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete asset: {str(e)}"
        )


class RecategorizeRequest(BaseModel):
    """Schema for recategorization request."""
    asset_ids: List[str] = Field(..., description="List of asset IDs to recategorize")


@router.post("/recategorize", response_model=List[AssetResponse])
async def recategorize_assets(
    request: RecategorizeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Recategorize assets using AI (OpenAI).
    
    Args:
        request: Request body with list of asset IDs
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        List of updated AssetResponse objects
        
    Raises:
        HTTPException: 400 if assets not found or don't belong to user, 500 if OpenAI fails
    """
    if not request.asset_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="asset_ids list cannot be empty"
        )
    
    # Fetch all assets and verify they belong to current user
    assets = db.query(Asset).filter(
        Asset.id.in_(request.asset_ids),
        Asset.user_id == current_user.id
    ).all()
    
    if len(assets) != len(request.asset_ids):
        # Some assets not found or don't belong to user
        found_ids = {asset.id for asset in assets}
        missing_ids = set(request.asset_ids) - found_ids
        
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Some assets not found or you don't have permission: {list(missing_ids)}"
        )
    
    try:
        # Prepare asset metadata for OpenAI
        assets_metadata = [
            {
                "id": asset.id,
                "filename": asset.filename,
                "file_type": asset.file_type,
                "category": asset.category
            }
            for asset in assets
        ]
        
        logger.info(f"Recategorizing {len(assets_metadata)} assets for user {current_user.id}")
        logger.debug(f"Asset metadata sent to OpenAI: {assets_metadata}")
        
        # Call OpenAI service to recategorize
        categorization_map = openai_service.categorize_assets(assets_metadata)
        
        logger.info(f"Received categorization map from OpenAI service: {categorization_map}")
        
        # Update assets in database
        updated_assets = []
        for asset in assets:
            if asset.id in categorization_map:
                old_category = asset.category
                asset.category = categorization_map[asset.id]
                asset.categorization_method = "ai"
                logger.info(f"Asset {asset.id} ({asset.filename}): {old_category} -> {asset.category}")
                updated_assets.append(asset)
            else:
                logger.warning(f"Asset {asset.id} ({asset.filename}) not found in categorization map")
        
        db.commit()
        
        # Refresh all assets
        for asset in updated_assets:
            db.refresh(asset)
        
        logger.info(f"Successfully recategorized {len(updated_assets)} assets")
        return updated_assets
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to recategorize assets: {str(e)}"
        )


class CategoryUpdateRequest(BaseModel):
    """Schema for manual category update request."""
    category: str = Field(..., description="New category for the asset")
    
    @field_validator('category')
    @classmethod
    def validate_category(cls, v):
        """Validate category is one of the allowed values."""
        valid_categories = ["logo", "image", "copy", "url", "pending"]
        if v not in valid_categories:
            raise ValueError(f"Category must be one of: {', '.join(valid_categories)}")
        return v


@router.patch("/{asset_id}/category", response_model=AssetResponse)
async def update_asset_category(
    asset_id: str,
    request: CategoryUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Manually update the category of an asset.
    
    Args:
        asset_id: ID of the asset to update
        request: Request body with new category
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Updated AssetResponse object
        
    Raises:
        HTTPException: 404 if asset not found, 403 if asset belongs to different user, 400 if invalid category
    """
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found"
        )
    
    if asset.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to update this asset"
        )
    
    try:
        # Update category and categorization method
        asset.category = request.category
        asset.categorization_method = "manual"
        
        db.commit()
        db.refresh(asset)
        
        return asset
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update asset category: {str(e)}"
        )

