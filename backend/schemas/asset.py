"""Pydantic schemas for asset operations."""
from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime


class AssetCreate(BaseModel):
    """Schema for creating an asset (used internally)."""
    filename: str
    s3_key: str
    s3_url: str
    file_type: str
    file_size_bytes: int
    category: str
    categorization_method: Optional[str] = None


class AssetResponse(BaseModel):
    """Schema for asset response."""
    id: str
    user_id: str
    filename: str
    s3_key: str
    s3_url: str
    file_type: str
    file_size_bytes: int
    category: str
    categorization_method: Optional[str] = None
    uploaded_at: datetime
    
    class Config:
        from_attributes = True


class AssetUpdate(BaseModel):
    """Schema for updating an asset."""
    category: Optional[str] = Field(None, description="New category for the asset")
    
    @field_validator('category')
    @classmethod
    def validate_category(cls, v):
        """Validate category is one of the allowed values."""
        if v is not None:
            valid_categories = ["logo", "image", "copy", "url", "pending"]
            if v not in valid_categories:
                raise ValueError(f"Category must be one of: {', '.join(valid_categories)}")
        return v

