"""FastAPI dependencies for authentication and authorization."""
from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models.user import User


async def get_current_user(
    x_user_id: str = Header(alias="X-User-ID"),
    db: Session = Depends(get_db)
) -> User:
    """
    Dependency to get the current authenticated user from X-User-ID header.
    
    Args:
        x_user_id: User ID from X-User-ID header
        db: Database session
        
    Returns:
        User: The authenticated user object
        
    Raises:
        HTTPException: 401 if user not found
    """
    user = db.query(User).filter(User.id == x_user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or invalid user ID"
        )
    
    return user

