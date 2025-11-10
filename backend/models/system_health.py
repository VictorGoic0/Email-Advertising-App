"""SystemHealth model for component health checks."""
from sqlalchemy import Column, String, Integer, Text, DateTime, Index
from sqlalchemy.sql import func
import uuid

from database import Base


class SystemHealth(Base):
    """System health model for tracking health checks of system components."""
    
    __tablename__ = "system_health"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    component = Column(String(100), nullable=False, index=True)  # api, s3, database, openai
    status = Column(String(50), nullable=False)  # healthy, degraded, down
    response_time_ms = Column(Integer)  # Response time in milliseconds
    error_message = Column(Text)  # Error message if status is not healthy
    checked_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    __table_args__ = (
        Index("idx_system_health_component", "component"),
        Index("idx_system_health_checked_at", "checked_at"),
    )

