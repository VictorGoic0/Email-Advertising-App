"""Campaign router for campaign management."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import time

from database import get_db
from dependencies import get_current_user
from models.user import User
from models.campaign import Campaign
from models.asset import Asset
from schemas.campaign import (
    CampaignCreate,
    CampaignResponse,
    CampaignUpdate,
    CampaignWithAssets,
    CampaignStatus,
    ProofGenerationResponse,
)
from crud.campaign import (
    get_campaigns_by_user,
    get_campaigns_by_status,
    get_campaign_with_assets,
    link_assets_to_campaign,
)
from crud.metrics import record_metric
from services.openai_service import openai_service
from services.mjml_service import compile_mjml_to_html

router = APIRouter(prefix="/api/campaigns", tags=["campaigns"])


@router.post("", response_model=CampaignResponse, status_code=status.HTTP_201_CREATED)
async def create_campaign(
    campaign_data: CampaignCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new campaign with linked assets.
    
    Args:
        campaign_data: Campaign creation data including asset IDs
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        CampaignResponse: Created campaign
        
    Raises:
        HTTPException: 400 if validation fails, 404 if assets not found or don't belong to user
    """
    # Verify all assets belong to current user
    assets = db.query(Asset).filter(
        Asset.id.in_(campaign_data.asset_ids),
        Asset.user_id == current_user.id
    ).all()
    
    if len(assets) != len(campaign_data.asset_ids):
        found_ids = {asset.id for asset in assets}
        missing_ids = set(campaign_data.asset_ids) - found_ids
        
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Some assets not found or you don't have permission: {list(missing_ids)}"
        )
    
    try:
        # Create campaign record
        campaign = Campaign(
            advertiser_id=current_user.id,
            campaign_name=campaign_data.campaign_name,
            target_audience=campaign_data.target_audience,
            campaign_goal=campaign_data.campaign_goal,
            additional_notes=campaign_data.additional_notes,
            status=CampaignStatus.DRAFT.value
        )
        
        db.add(campaign)
        db.flush()  # Flush to get campaign ID
        
        # Link assets to campaign
        link_assets_to_campaign(
            db=db,
            campaign_id=campaign.id,
            asset_ids=campaign_data.asset_ids
        )
        
        db.commit()
        db.refresh(campaign)
        
        return campaign
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create campaign: {str(e)}"
        )


@router.get("", response_model=List[CampaignResponse])
async def get_campaigns(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all campaigns based on user role.
    
    - Advertisers see only their own campaigns
    - Campaign managers see campaigns with status "pending_approval"
    
    Args:
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        List of CampaignResponse objects
    """
    if current_user.role == "campaign_manager":
        # Managers see pending approval campaigns
        campaigns = get_campaigns_by_status(db, CampaignStatus.PENDING_APPROVAL.value)
    else:
        # Advertisers see their own campaigns
        campaigns = get_campaigns_by_user(db, current_user.id)
    
    return campaigns


@router.get("/{campaign_id}", response_model=CampaignWithAssets)
async def get_campaign(
    campaign_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific campaign with its linked assets.
    
    Args:
        campaign_id: ID of the campaign
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        CampaignWithAssets: Campaign with linked assets
        
    Raises:
        HTTPException: 404 if campaign not found, 403 if user doesn't have permission
    """
    campaign = get_campaign_with_assets(db, campaign_id)
    
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found"
        )
    
    # Check permissions
    # Advertisers can only see their own campaigns
    # Managers can see pending_approval campaigns
    if current_user.role == "advertiser":
        if campaign.advertiser_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to view this campaign"
            )
    elif current_user.role == "campaign_manager":
        # Managers can only see pending_approval campaigns
        if campaign.status != CampaignStatus.PENDING_APPROVAL.value:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only view campaigns pending approval"
            )
    
    return campaign


@router.patch("/{campaign_id}", response_model=CampaignResponse)
async def update_campaign(
    campaign_id: str,
    campaign_data: CampaignUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update campaign details (name, audience, goal, notes).
    
    Only the advertiser who owns the campaign can update it.
    Only draft campaigns can be updated.
    
    Args:
        campaign_id: ID of the campaign to update
        campaign_data: Campaign update data
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        CampaignResponse: Updated campaign
        
    Raises:
        HTTPException: 404 if campaign not found, 403 if user doesn't have permission, 400 if campaign is not in draft status
    """
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found"
        )
    
    # Verify campaign belongs to current user
    if campaign.advertiser_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to update this campaign"
        )
    
    # Only draft campaigns can be updated
    if campaign.status != CampaignStatus.DRAFT.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot update campaign with status '{campaign.status}'. Only draft campaigns can be updated."
        )
    
    try:
        # Update fields if provided
        if campaign_data.campaign_name is not None:
            campaign.campaign_name = campaign_data.campaign_name
        if campaign_data.target_audience is not None:
            campaign.target_audience = campaign_data.target_audience
        if campaign_data.campaign_goal is not None:
            campaign.campaign_goal = campaign_data.campaign_goal
        if campaign_data.additional_notes is not None:
            campaign.additional_notes = campaign_data.additional_notes
        
        db.commit()
        db.refresh(campaign)
        
        return campaign
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update campaign: {str(e)}"
        )


@router.delete("/{campaign_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_campaign(
    campaign_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a campaign and cascade to campaign_assets.
    
    Only the advertiser who owns the campaign can delete it.
    Only draft campaigns can be deleted.
    
    Args:
        campaign_id: ID of the campaign to delete
        current_user: Current authenticated user
        db: Database session
        
    Raises:
        HTTPException: 404 if campaign not found, 403 if user doesn't have permission, 400 if campaign is not in draft status
    """
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found"
        )
    
    # Verify campaign belongs to current user
    if campaign.advertiser_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this campaign"
        )
    
    # Only draft campaigns can be deleted
    if campaign.status != CampaignStatus.DRAFT.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete campaign with status '{campaign.status}'. Only draft campaigns can be deleted."
        )
    
    try:
        # Delete campaign (cascade will handle campaign_assets)
        db.delete(campaign)
        db.commit()
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete campaign: {str(e)}"
        )


@router.post("/{campaign_id}/generate-proof", response_model=ProofGenerationResponse)
async def generate_proof(
    campaign_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate email proof (MJML and HTML) for a campaign using AI.
    
    Args:
        campaign_id: ID of the campaign
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        ProofGenerationResponse: Generated MJML, HTML, and generation time
        
    Raises:
        HTTPException: 404 if campaign not found, 403 if user doesn't have permission, 500 if generation fails
    """
    # Fetch campaign with assets
    campaign = get_campaign_with_assets(db, campaign_id)
    
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found"
        )
    
    # Verify campaign belongs to current user
    if campaign.advertiser_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to generate proof for this campaign"
        )
    
    # Check if campaign has assets
    if not campaign.campaign_assets:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Campaign must have at least one asset to generate proof"
        )
    
    # Start performance timer
    start_time = time.time()
    
    try:
        # Prepare campaign details for OpenAI
        campaign_details = {
            "name": campaign.campaign_name,
            "audience": campaign.target_audience or "general audience",
            "goal": campaign.campaign_goal or "engage customers",
            "notes": campaign.additional_notes or ""
        }
        
        # Prepare assets for OpenAI
        assets = []
        for campaign_asset in campaign.campaign_assets:
            asset = campaign_asset.asset
            assets.append({
                "id": asset.id,
                "filename": asset.filename,
                "s3_url": asset.s3_url,
                "category": asset.category,
                "file_type": asset.file_type
            })
        
        # Generate MJML using OpenAI
        mjml_code = openai_service.generate_email_mjml(
            campaign_details=campaign_details,
            assets=assets
        )
        
        # Compile MJML to HTML
        html_code = compile_mjml_to_html(mjml_code)
        
        # Calculate generation time
        generation_time = time.time() - start_time
        
        # Update campaign with generated content
        campaign.generated_email_mjml = mjml_code
        campaign.generated_email_html = html_code
        
        # Record performance metric
        record_metric(
            db=db,
            metric_type="proof_generation_time",
            metric_value=generation_time,
            metadata={
                "campaign_id": campaign_id,
                "campaign_name": campaign.campaign_name,
                "asset_count": len(assets),
                "mjml_length": len(mjml_code),
                "html_length": len(html_code)
            }
        )
        
        db.commit()
        
        return ProofGenerationResponse(
            mjml=mjml_code,
            html=html_code,
            generation_time=round(generation_time, 2)
        )
        
    except ValueError as e:
        # MJML compilation errors
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to compile MJML: {str(e)}"
        )
    except RuntimeError as e:
        # MJML command not found
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"MJML service error: {str(e)}"
        )
    except Exception as e:
        # OpenAI or other errors
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate email proof: {str(e)}"
        )

