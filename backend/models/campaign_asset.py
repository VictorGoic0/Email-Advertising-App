"""CampaignAsset model for many-to-many relationship between campaigns and assets."""
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Index, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from database import Base


class CampaignAsset(Base):
    """Junction table linking campaigns to assets (many-to-many relationship)."""
    
    __tablename__ = "campaign_assets"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    campaign_id = Column(String, ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False, index=True)
    asset_id = Column(String, ForeignKey("assets.id", ondelete="CASCADE"), nullable=False, index=True)
    asset_role = Column(String(50))  # primary_logo, hero_image, body_copy, etc.
    display_order = Column(Integer)  # Order for assets of same role
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    campaign = relationship("Campaign", back_populates="campaign_assets")
    asset = relationship("Asset", back_populates="campaign_assets")
    
    __table_args__ = (
        UniqueConstraint("campaign_id", "asset_id", name="uq_campaign_asset"),
        Index("idx_campaign_assets_campaign_id", "campaign_id"),
        Index("idx_campaign_assets_asset_id", "asset_id"),
    )

