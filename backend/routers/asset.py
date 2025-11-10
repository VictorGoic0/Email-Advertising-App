"""Asset router for file upload and management."""
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from dependencies import get_current_user
from models.user import User
from models.asset import Asset
from schemas.asset import AssetResponse, AssetUpdate
from services.s3_service import s3_service
from services.categorization_service import categorize_asset

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

