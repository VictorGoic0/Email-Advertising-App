"""Authentication router for login and user management."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from schemas.user import LoginRequest, LoginResponse, UserResponse

router = APIRouter(prefix="/api/auth", tags=["authentication"])


@router.post("/login", response_model=LoginResponse, status_code=status.HTTP_200_OK)
async def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    """
    Login endpoint that authenticates a user by email and password.
    
    Args:
        login_data: Login credentials (email and password)
        db: Database session
        
    Returns:
        LoginResponse: User object with id, email, full_name, and role
        
    Raises:
        HTTPException: 401 if credentials are invalid
    """
    # Query user by email
    user = db.query(User).filter(User.email == login_data.email).first()
    
    # Check if user exists and password matches (plain text comparison for MVP)
    if not user or user.password != login_data.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Return user object
    return LoginResponse(
        user=UserResponse(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            role=user.role
        )
    )

