"""Campaign model for email advertising campaigns."""
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from database import Base


class Campaign(Base):
    """Campaign model storing campaign details and generated email content."""
    
    __tablename__ = "campaigns"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    advertiser_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    campaign_name = Column(String(255), nullable=False)
    target_audience = Column(Text)
    campaign_goal = Column(Text)
    additional_notes = Column(Text)
    
    # Generated email content
    generated_email_html = Column(Text)  # Compiled HTML for email clients
    generated_email_mjml = Column(Text)  # Source MJML template
    
    # Status tracking
    status = Column(String(50), nullable=False, default="draft", index=True)  # draft, pending_approval, approved, rejected
    
    # Approval workflow
    reviewed_by = Column(String, ForeignKey("users.id"), index=True)
    reviewed_at = Column(DateTime(timezone=True))
    rejection_reason = Column(Text)
    
    # Optional scheduling (P1 feature - data model ready, UI not implemented)
    scheduled_send_date = Column(DateTime(timezone=True))
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    advertiser = relationship("User", foreign_keys=[advertiser_id], back_populates="campaigns")
    reviewer = relationship("User", foreign_keys=[reviewed_by], back_populates="reviewed_campaigns")
    campaign_assets = relationship("CampaignAsset", back_populates="campaign", cascade="all, delete-orphan")
    
    __table_args__ = (
        Index("idx_campaigns_advertiser_id", "advertiser_id"),
        Index("idx_campaigns_status", "status"),
        Index("idx_campaigns_created_at", "created_at"),
        Index("idx_campaigns_reviewed_by", "reviewed_by"),
    )

