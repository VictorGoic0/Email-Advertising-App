"""Metrics router for performance monitoring endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import List
from datetime import datetime, timedelta
from decimal import Decimal
import statistics

from database import get_db
from dependencies import get_current_user
from models.user import User
from models.system_health import SystemHealth
from models.performance_metric import PerformanceMetric
from schemas.metrics import (
    UptimeMetricsResponse,
    ProofGenerationMetricsResponse,
    QueueDepthMetricsResponse,
    ApprovalRateMetricsResponse,
)
from crud.metrics import get_queue_depth, calculate_approval_rate

router = APIRouter(prefix="/api/metrics", tags=["metrics"])


def require_tech_support(current_user: User) -> None:
    """
    Verify user has tech_support role.
    
    Args:
        current_user: Current authenticated user
        
    Raises:
        HTTPException: 403 if user is not tech_support
    """
    if current_user.role != "tech_support":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only tech_support users can access metrics endpoints"
        )


@router.get("/uptime", response_model=UptimeMetricsResponse)
async def get_uptime_metrics(
    component: str = Query(..., description="Component name (api, s3, database, openai)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get uptime metrics for a system component over the last 24 hours.
    
    Args:
        component: Component name to check (api, s3, database, openai)
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        UptimeMetricsResponse: Uptime metrics for the component
        
    Raises:
        HTTPException: 403 if user is not tech_support, 400 if invalid component
    """
    require_tech_support(current_user)
    
    # Validate component name
    valid_components = ["api", "s3", "database", "openai"]
    if component not in valid_components:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid component. Must be one of: {', '.join(valid_components)}"
        )
    
    # Query system_health table for last 24 hours
    cutoff_time = datetime.now() - timedelta(hours=24)
    
    health_checks = db.query(SystemHealth).filter(
        and_(
            SystemHealth.component == component,
            SystemHealth.checked_at >= cutoff_time
        )
    ).all()
    
    total_checks = len(health_checks)
    
    if total_checks == 0:
        # No data available
        return UptimeMetricsResponse(
            uptime_percentage=0.0,
            total_checks=0,
            healthy_checks=0,
            degraded_checks=0,
            down_checks=0,
            component=component
        )
    
    # Count checks by status
    healthy_checks = sum(1 for check in health_checks if check.status == "healthy")
    degraded_checks = sum(1 for check in health_checks if check.status == "degraded")
    down_checks = sum(1 for check in health_checks if check.status == "down")
    
    # Calculate uptime percentage (healthy checks / total checks)
    uptime_percentage = (healthy_checks / total_checks) * 100
    
    return UptimeMetricsResponse(
        uptime_percentage=round(uptime_percentage, 2),
        total_checks=total_checks,
        healthy_checks=healthy_checks,
        degraded_checks=degraded_checks,
        down_checks=down_checks,
        component=component
    )


@router.get("/proof-generation", response_model=ProofGenerationMetricsResponse)
async def get_proof_generation_metrics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get proof generation performance metrics (average, P50, P95, P99).
    
    Args:
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        ProofGenerationMetricsResponse: Proof generation metrics
        
    Raises:
        HTTPException: 403 if user is not tech_support
    """
    require_tech_support(current_user)
    
    # Query performance_metrics table for proof generation times
    metrics = db.query(PerformanceMetric).filter(
        PerformanceMetric.metric_type == "proof_generation_time"
    ).all()
    
    if not metrics:
        # No data available
        return ProofGenerationMetricsResponse(
            average=0.0,
            p50=0.0,
            p95=0.0,
            p99=0.0,
            total_generations=0
        )
    
    # Extract metric values as floats
    values = [float(metric.metric_value) for metric in metrics]
    
    # Calculate statistics
    avg = statistics.mean(values)
    total = len(values)
    
    # Calculate percentiles
    sorted_values = sorted(values)
    p50 = statistics.median(sorted_values)
    
    # P95: 95th percentile (using standard percentile formula)
    # For n values, P95 is at index (n-1) * 0.95
    if total > 1:
        p95_index = int((total - 1) * 0.95)
        p95 = sorted_values[p95_index]
    else:
        p95 = sorted_values[0] if total == 1 else 0.0
    
    # P99: 99th percentile
    if total > 1:
        p99_index = int((total - 1) * 0.99)
        p99 = sorted_values[p99_index]
    else:
        p99 = sorted_values[0] if total == 1 else 0.0
    
    return ProofGenerationMetricsResponse(
        average=round(avg, 2),
        p50=round(p50, 2),
        p95=round(p95, 2),
        p99=round(p99, 2),
        total_generations=total
    )


@router.get("/queue-depth", response_model=QueueDepthMetricsResponse)
async def get_queue_depth_metrics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current approval queue depth.
    
    Args:
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        QueueDepthMetricsResponse: Current queue depth
        
    Raises:
        HTTPException: 403 if user is not tech_support
    """
    require_tech_support(current_user)
    
    # Use existing function from crud.metrics
    depth = get_queue_depth(db)
    
    return QueueDepthMetricsResponse(queue_depth=depth)


@router.get("/approval-rate", response_model=ApprovalRateMetricsResponse)
async def get_approval_rate_metrics(
    days: int = Query(7, ge=1, le=365, description="Number of days to look back (default: 7)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get campaign approval rate metrics over a specified time period.
    
    Args:
        days: Number of days to look back (default: 7, min: 1, max: 365)
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        ApprovalRateMetricsResponse: Approval rate metrics with breakdown
        
    Raises:
        HTTPException: 403 if user is not tech_support
    """
    require_tech_support(current_user)
    
    # Use existing function from crud.metrics
    result = calculate_approval_rate(db, days=days)
    
    return ApprovalRateMetricsResponse(
        approval_rate=result["approval_rate"],
        total_reviewed=result["total_reviewed"],
        approved_count=result["approved_count"],
        rejected_count=result["rejected_count"],
        days=result["days"]
    )

