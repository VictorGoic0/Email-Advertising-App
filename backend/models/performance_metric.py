"""PerformanceMetric model for system performance monitoring."""
from sqlalchemy import Column, String, Numeric, DateTime, JSON, Index
from sqlalchemy.sql import func
import uuid

from database import Base


class PerformanceMetric(Base):
    """Performance metric model for storing system performance data."""
    
    __tablename__ = "performance_metrics"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    metric_type = Column(String(100), nullable=False, index=True)  # proof_generation_time, api_response_time, etc.
    metric_value = Column(Numeric(10, 2))  # Metric value
    metadata_json = Column(JSON)  # Flexible storage for additional context (SQLite uses JSON)
    recorded_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    __table_args__ = (
        Index("idx_performance_metrics_type", "metric_type"),
        Index("idx_performance_metrics_recorded_at", "recorded_at"),
    )

