"""CRUD operations for performance metrics."""
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import Optional, Dict, Any
from decimal import Decimal
from datetime import datetime, timedelta

from models.performance_metric import PerformanceMetric
from models.campaign import Campaign


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


def get_queue_depth(db: Session) -> int:
    """
    Calculate the current approval queue depth.
    
    Returns the count of campaigns with status "pending_approval".
    
    Args:
        db: Database session
        
    Returns:
        int: Number of campaigns pending approval
    """
    return db.query(Campaign).filter(Campaign.status == "pending_approval").count()


def calculate_approval_rate(db: Session, days: int = 7) -> Dict[str, Any]:
    """
    Calculate campaign approval rate over a specified time period.
    
    Args:
        db: Database session
        days: Number of days to look back (default: 7)
        
    Returns:
        Dict with approval_rate (percentage), total_reviewed, approved_count, rejected_count
    """
    cutoff_date = datetime.now() - timedelta(days=days)
    
    # Get all reviewed campaigns (approved or rejected) within the time period
    reviewed_campaigns = db.query(Campaign).filter(
        and_(
            Campaign.reviewed_at >= cutoff_date,
            Campaign.status.in_(["approved", "rejected"])
        )
    ).all()
    
    total_reviewed = len(reviewed_campaigns)
    approved_count = sum(1 for c in reviewed_campaigns if c.status == "approved")
    rejected_count = sum(1 for c in reviewed_campaigns if c.status == "rejected")
    
    # Calculate approval rate percentage
    approval_rate = (approved_count / total_reviewed * 100) if total_reviewed > 0 else 0.0
    
    return {
        "approval_rate": round(approval_rate, 2),
        "total_reviewed": total_reviewed,
        "approved_count": approved_count,
        "rejected_count": rejected_count,
        "days": days
    }


def calculate_time_to_approval(db: Session, days: int = 7) -> Optional[float]:
    """
    Calculate average time to approval for approved campaigns.
    
    Time to approval is calculated as the difference between created_at and reviewed_at.
    
    Args:
        db: Database session
        days: Number of days to look back (default: 7)
        
    Returns:
        float: Average time to approval in hours, or None if no approved campaigns found
    """
    cutoff_date = datetime.now() - timedelta(days=days)
    
    # Get approved campaigns within the time period
    approved_campaigns = db.query(Campaign).filter(
        and_(
            Campaign.status == "approved",
            Campaign.reviewed_at >= cutoff_date,
            Campaign.reviewed_at.isnot(None),
            Campaign.created_at.isnot(None)
        )
    ).all()
    
    if not approved_campaigns:
        return None
    
    # Calculate time differences in hours
    time_differences = []
    for campaign in approved_campaigns:
        if campaign.reviewed_at and campaign.created_at:
            delta = campaign.reviewed_at - campaign.created_at
            hours = delta.total_seconds() / 3600
            time_differences.append(hours)
    
    if not time_differences:
        return None
    
    # Return average time to approval in hours
    return round(sum(time_differences) / len(time_differences), 2)

