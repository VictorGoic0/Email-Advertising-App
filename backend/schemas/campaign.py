"""Pydantic schemas for campaign operations."""
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime
from enum import Enum

from schemas.asset import AssetResponse


class CampaignStatus(str, Enum):
    """Campaign status enum."""
    DRAFT = "draft"
    PENDING_APPROVAL = "pending_approval"
    APPROVED = "approved"
    REJECTED = "rejected"


class CampaignCreate(BaseModel):
    """Schema for creating a campaign."""
    campaign_name: str = Field(..., min_length=1, max_length=255, description="Name of the campaign")
    target_audience: Optional[str] = Field(None, description="Target audience description")
    campaign_goal: Optional[str] = Field(None, description="Campaign goal description")
    additional_notes: Optional[str] = Field(None, description="Additional notes for the campaign")
    asset_ids: List[str] = Field(..., min_items=1, description="List of asset IDs to link to the campaign")
    
    @field_validator('campaign_name')
    @classmethod
    def validate_campaign_name(cls, v):
        """Validate campaign name is not empty."""
        if not v or not v.strip():
            raise ValueError("Campaign name cannot be empty")
        return v.strip()


class CampaignUpdate(BaseModel):
    """Schema for updating a campaign."""
    campaign_name: Optional[str] = Field(None, min_length=1, max_length=255, description="Name of the campaign")
    target_audience: Optional[str] = Field(None, description="Target audience description")
    campaign_goal: Optional[str] = Field(None, description="Campaign goal description")
    additional_notes: Optional[str] = Field(None, description="Additional notes for the campaign")
    
    @field_validator('campaign_name')
    @classmethod
    def validate_campaign_name(cls, v):
        """Validate campaign name is not empty if provided."""
        if v is not None and (not v or not v.strip()):
            raise ValueError("Campaign name cannot be empty")
        return v.strip() if v else None


class CampaignAssetResponse(BaseModel):
    """Schema for campaign asset relationship response."""
    id: str
    campaign_id: str
    asset_id: str
    asset_role: Optional[str] = None
    display_order: Optional[int] = None
    created_at: datetime
    asset: AssetResponse
    
    class Config:
        from_attributes = True


class CampaignResponse(BaseModel):
    """Schema for campaign response."""
    id: str
    advertiser_id: str
    campaign_name: str
    target_audience: Optional[str] = None
    campaign_goal: Optional[str] = None
    additional_notes: Optional[str] = None
    generated_email_html: Optional[str] = None
    generated_email_mjml: Optional[str] = None
    status: str
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    scheduled_send_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class CampaignWithAssets(CampaignResponse):
    """Schema for campaign response with linked assets."""
    campaign_assets: List[CampaignAssetResponse] = []
    
    class Config:
        from_attributes = True

