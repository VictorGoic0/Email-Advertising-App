"""User model for authentication and role-based access."""
from sqlalchemy import Column, String, DateTime, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from database import Base


class User(Base):
    """User model with role-based access control."""
    
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)  # Plain text for MVP
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, index=True)  # advertiser, campaign_manager, tech_support
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    assets = relationship("Asset", back_populates="user", cascade="all, delete-orphan")
    campaigns = relationship("Campaign", foreign_keys="Campaign.advertiser_id", back_populates="advertiser", cascade="all, delete-orphan")
    reviewed_campaigns = relationship("Campaign", foreign_keys="Campaign.reviewed_by", back_populates="reviewer")
    
    __table_args__ = (
        Index("idx_users_email", "email"),
        Index("idx_users_role", "role"),
    )

