"""Asset model for uploaded files metadata."""
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from database import Base


class Asset(Base):
    """Asset model storing metadata for files uploaded to S3."""
    
    __tablename__ = "assets"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    s3_key = Column(String(512), nullable=False)  # S3 object key
    s3_url = Column(String, nullable=False)  # Pre-signed or public URL
    file_type = Column(String(50), nullable=False)  # MIME type
    file_size_bytes = Column(Integer, nullable=False)
    category = Column(String(50), nullable=False, index=True)  # pending, logo, image, copy, url
    categorization_method = Column(String(50))  # rules, ai, manual
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    # Relationships
    user = relationship("User", back_populates="assets")
    campaign_assets = relationship("CampaignAsset", back_populates="asset", cascade="all, delete-orphan")
    
    __table_args__ = (
        Index("idx_assets_user_id", "user_id"),
        Index("idx_assets_category", "category"),
        Index("idx_assets_uploaded_at", "uploaded_at"),
    )

