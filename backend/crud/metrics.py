"""CRUD operations for performance metrics."""
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
from decimal import Decimal

from models.performance_metric import PerformanceMetric


def record_metric(
    db: Session,
    metric_type: str,
    metric_value: float,
    metadata: Optional[Dict[str, Any]] = None
) -> PerformanceMetric:
    """
    Record a performance metric in the database.
    
    Args:
        db: Database session
        metric_type: Type of metric (e.g., "proof_generation_time", "api_response_time")
        metric_value: Value of the metric (e.g., time in seconds)
        metadata: Optional dictionary with additional context
        
    Returns:
        PerformanceMetric: Created metric record
    """
    metric = PerformanceMetric(
        metric_type=metric_type,
        metric_value=Decimal(str(metric_value)),
        metadata_json=metadata
    )
    
    db.add(metric)
    db.flush()  # Flush to get ID without committing
    
    return metric

