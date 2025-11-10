"""Health check service for system components."""
import time
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text

from models.system_health import SystemHealth
from services.s3_service import s3_service
from services.openai_service import openai_service
from database import engine


def check_s3_health() -> Dict[str, Any]:
    """
    Check S3 service health by attempting to list bucket contents.
    
    Returns:
        Dict with status ("healthy", "degraded", "down"), response_time_ms, and optional error_message
    """
    start_time = time.time()
    
    try:
        # Try to list bucket contents (lightweight operation)
        s3_service.s3_client.list_objects_v2(
            Bucket=s3_service.bucket_name,
            MaxKeys=1
        )
        
        response_time_ms = int((time.time() - start_time) * 1000)
        
        return {
            "status": "healthy",
            "response_time_ms": response_time_ms,
            "error_message": None
        }
        
    except Exception as e:
        response_time_ms = int((time.time() - start_time) * 1000)
        error_msg = str(e)
        
        # Determine status based on error type
        if "AccessDenied" in error_msg or "InvalidAccessKeyId" in error_msg:
            status = "down"
        else:
            status = "degraded"
        
        return {
            "status": status,
            "response_time_ms": response_time_ms,
            "error_message": error_msg
        }


def check_database_health() -> Dict[str, Any]:
    """
    Check database health by executing a simple query.
    
    Returns:
        Dict with status ("healthy", "degraded", "down"), response_time_ms, and optional error_message
    """
    start_time = time.time()
    
    try:
        # Execute a simple query to check database connectivity
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            result.fetchone()
        
        response_time_ms = int((time.time() - start_time) * 1000)
        
        return {
            "status": "healthy",
            "response_time_ms": response_time_ms,
            "error_message": None
        }
        
    except Exception as e:
        response_time_ms = int((time.time() - start_time) * 1000)
        error_msg = str(e)
        
        # Determine status based on error type
        if "OperationalError" in str(type(e).__name__) or "DatabaseError" in str(type(e).__name__):
            status = "down"
        else:
            status = "degraded"
        
        return {
            "status": status,
            "response_time_ms": response_time_ms,
            "error_message": error_msg
        }


def check_openai_health() -> Dict[str, Any]:
    """
    Check OpenAI service health by attempting to make a lightweight API call.
    
    Returns:
        Dict with status ("healthy", "degraded", "down"), response_time_ms, and optional error_message
    """
    start_time = time.time()
    
    try:
        # Try to access the OpenAI client (this will validate API key)
        # Make a minimal API call to check connectivity
        if not openai_service.client:
            raise ValueError("OpenAI client not initialized")
        
        # Make a lightweight API call (list models is a simple operation)
        openai_service.client.models.list(limit=1)
        
        response_time_ms = int((time.time() - start_time) * 1000)
        
        return {
            "status": "healthy",
            "response_time_ms": response_time_ms,
            "error_message": None
        }
        
    except ValueError as e:
        # API key not set
        response_time_ms = int((time.time() - start_time) * 1000)
        return {
            "status": "down",
            "response_time_ms": response_time_ms,
            "error_message": str(e)
        }
        
    except Exception as e:
        response_time_ms = int((time.time() - start_time) * 1000)
        error_msg = str(e)
        
        # Determine status based on error type
        if "InvalidAPIKey" in error_msg or "AuthenticationError" in error_msg:
            status = "down"
        elif "RateLimitError" in error_msg or "APIConnectionError" in error_msg:
            status = "degraded"
        else:
            status = "degraded"
        
        return {
            "status": status,
            "response_time_ms": response_time_ms,
            "error_message": error_msg
        }


def check_api_health() -> Dict[str, Any]:
    """
    Check API health by verifying database connectivity (API depends on database).
    
    Returns:
        Dict with status ("healthy", "degraded", "down"), response_time_ms, and optional error_message
    """
    start_time = time.time()
    
    try:
        # API health is tied to database health since API can't function without DB
        # Use the same check as database but label it as API
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            result.fetchone()
        
        response_time_ms = int((time.time() - start_time) * 1000)
        
        return {
            "status": "healthy",
            "response_time_ms": response_time_ms,
            "error_message": None
        }
        
    except Exception as e:
        response_time_ms = int((time.time() - start_time) * 1000)
        error_msg = str(e)
        
        # Determine status based on error type
        if "OperationalError" in str(type(e).__name__) or "DatabaseError" in str(type(e).__name__):
            status = "down"
        else:
            status = "degraded"
        
        return {
            "status": status,
            "response_time_ms": response_time_ms,
            "error_message": error_msg
        }


def perform_all_health_checks(db: Session) -> Dict[str, Dict[str, Any]]:
    """
    Perform health checks for all system components and record results.
    
    Args:
        db: Database session
        
    Returns:
        Dict mapping component names to their health check results
    """
    results = {}
    
    # Check API (depends on database)
    api_result = check_api_health()
    results["api"] = api_result
    _record_health_check(db, "api", api_result)
    
    # Check S3
    s3_result = check_s3_health()
    results["s3"] = s3_result
    _record_health_check(db, "s3", s3_result)
    
    # Check Database
    db_result = check_database_health()
    results["database"] = db_result
    _record_health_check(db, "database", db_result)
    
    # Check OpenAI
    openai_result = check_openai_health()
    results["openai"] = openai_result
    _record_health_check(db, "openai", openai_result)
    
    return results


def _record_health_check(db: Session, component: str, result: Dict[str, Any]) -> None:
    """
    Record a health check result in the system_health table.
    
    Args:
        db: Database session
        component: Component name (s3, database, openai)
        result: Health check result dict with status, response_time_ms, error_message
    """
    health_record = SystemHealth(
        component=component,
        status=result["status"],
        response_time_ms=result["response_time_ms"],
        error_message=result.get("error_message")
    )
    
    db.add(health_record)
    db.flush()  # Flush to save without committing (caller will commit)

