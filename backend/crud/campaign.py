"""CRUD operations for campaign database queries."""
from sqlalchemy.orm import Session
from typing import List, Optional
from sqlalchemy.orm import joinedload

from models.campaign import Campaign
from models.campaign_asset import CampaignAsset
from models.asset import Asset


def get_campaigns_by_user(db: Session, user_id: str) -> List[Campaign]:
    """
    Get all campaigns for a specific user.
    
    Args:
        db: Database session
        user_id: ID of the user
        
    Returns:
        List of Campaign objects
    """
    return db.query(Campaign).filter(Campaign.advertiser_id == user_id).all()


def get_campaigns_by_status(db: Session, status: str) -> List[Campaign]:
    """
    Get all campaigns with a specific status.
    
    Args:
        db: Database session
        status: Campaign status (draft, pending_approval, approved, rejected)
        
    Returns:
        List of Campaign objects
    """
    return db.query(Campaign).filter(Campaign.status == status).all()


def get_campaign_with_assets(db: Session, campaign_id: str) -> Optional[Campaign]:
    """
    Get a campaign with its linked assets.
    
    Args:
        db: Database session
        campaign_id: ID of the campaign
        
    Returns:
        Campaign object with campaign_assets relationship loaded, or None if not found
    """
    return db.query(Campaign).options(
        joinedload(Campaign.campaign_assets).joinedload(CampaignAsset.asset)
    ).filter(Campaign.id == campaign_id).first()


def link_assets_to_campaign(
    db: Session,
    campaign_id: str,
    asset_ids: List[str],
    asset_roles: Optional[List[str]] = None,
    display_orders: Optional[List[int]] = None
) -> List[CampaignAsset]:
    """
    Link assets to a campaign by creating CampaignAsset records.
    
    Args:
        db: Database session
        campaign_id: ID of the campaign
        asset_ids: List of asset IDs to link
        asset_roles: Optional list of asset roles (e.g., "primary_logo", "hero_image")
        display_orders: Optional list of display orders
        
    Returns:
        List of created CampaignAsset objects
    """
    campaign_assets = []
    
    for idx, asset_id in enumerate(asset_ids):
        asset_role = asset_roles[idx] if asset_roles and idx < len(asset_roles) else None
        display_order = display_orders[idx] if display_orders and idx < len(display_orders) else idx
        
        campaign_asset = CampaignAsset(
            campaign_id=campaign_id,
            asset_id=asset_id,
            asset_role=asset_role,
            display_order=display_order
        )
        db.add(campaign_asset)
        campaign_assets.append(campaign_asset)
    
    db.flush()  # Flush to get IDs without committing
    return campaign_assets

