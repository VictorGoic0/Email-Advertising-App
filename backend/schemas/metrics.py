"""Pydantic schemas for metrics endpoints."""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any


class UptimeMetricsResponse(BaseModel):
    """Schema for uptime metrics response."""
    uptime_percentage: float = Field(..., description="Uptime percentage over the last 24 hours")
    total_checks: int = Field(..., description="Total number of health checks in the period")
    healthy_checks: int = Field(..., description="Number of healthy checks")
    degraded_checks: int = Field(..., description="Number of degraded checks")
    down_checks: int = Field(..., description="Number of down checks")
    component: str = Field(..., description="Component name (api, s3, database, openai)")
    
    class Config:
        from_attributes = True


class ProofGenerationMetricsResponse(BaseModel):
    """Schema for proof generation metrics response."""
    average: float = Field(..., description="Average proof generation time in seconds")
    p50: float = Field(..., description="50th percentile (median) in seconds")
    p95: float = Field(..., description="95th percentile in seconds")
    p99: float = Field(..., description="99th percentile in seconds")
    total_generations: int = Field(..., description="Total number of proof generations")
    
    class Config:
        from_attributes = True


class QueueDepthMetricsResponse(BaseModel):
    """Schema for queue depth metrics response."""
    queue_depth: int = Field(..., description="Current number of campaigns pending approval")
    
    class Config:
        from_attributes = True


class ApprovalRateMetricsResponse(BaseModel):
    """Schema for approval rate metrics response."""
    approval_rate: float = Field(..., description="Approval rate percentage")
    total_reviewed: int = Field(..., description="Total number of reviewed campaigns")
    approved_count: int = Field(..., description="Number of approved campaigns")
    rejected_count: int = Field(..., description="Number of rejected campaigns")
    days: int = Field(..., description="Number of days in the time period")
    
    class Config:
        from_attributes = True

