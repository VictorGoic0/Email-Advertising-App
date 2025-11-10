"""Background worker for scheduled health checks."""
import time
import logging
import sys
from pathlib import Path

# Add backend directory to path for imports
backend_dir = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

from database import SessionLocal
from services.health_service import perform_all_health_checks

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('health_check_worker.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)


def run_health_checks():
    """
    Perform all health checks and record results in database.
    
    This function is called every 5 minutes by the scheduler.
    """
    db = SessionLocal()
    
    try:
        logger.info("Starting scheduled health checks...")
        
        # Perform all health checks
        results = perform_all_health_checks(db)
        
        # Commit results to database
        db.commit()
        
        # Log results
        for component, result in results.items():
            status = result["status"]
            response_time = result["response_time_ms"]
            logger.info(
                f"Health check - Component: {component}, "
                f"Status: {status}, "
                f"Response time: {response_time}ms"
            )
        
        logger.info("Health checks completed successfully")
        
    except Exception as e:
        logger.error(f"Error during health checks: {str(e)}", exc_info=True)
        db.rollback()
        
    finally:
        db.close()


def main():
    """
    Main function to run health checks on a schedule (every 5 minutes).
    
    This script runs indefinitely, performing health checks every 5 minutes.
    """
    logger.info("Health check worker started")
    logger.info("Running health checks every 5 minutes...")
    
    # Run initial health check
    run_health_checks()
    
    # Schedule health checks every 5 minutes (300 seconds)
    interval_seconds = 300
    
    try:
        while True:
            time.sleep(interval_seconds)
            run_health_checks()
            
    except KeyboardInterrupt:
        logger.info("Health check worker stopped by user")
    except Exception as e:
        logger.error(f"Fatal error in health check worker: {str(e)}", exc_info=True)
        raise


if __name__ == "__main__":
    main()

