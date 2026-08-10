from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import JWTError, jwt
from app.database import get_db
from app.models import User, Role
from app.schemas import UserCreate, UserResponse
from app.auth import get_password_hash, verify_password, create_access_token, SECRET_KEY, ALGORITHM
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    try:
        # Check if email already exists
        db_user = db.query(User).filter(User.email == user.email).first()
        if db_user:
            raise HTTPException(status_code=400, detail="Email already registered")

        # Check if mobile number already exists
        db_mobile = db.query(User).filter(User.mobile_number == user.mobile_number).first()
        if db_mobile:
            raise HTTPException(status_code=400, detail="Mobile number already registered")

        # Create new user with default RENTER role
        hashed_password = get_password_hash(user.password)
        new_user = User(
            email=user.email,
            full_name=user.full_name,
            mobile_number=user.mobile_number,
            hashed_password=hashed_password,
            role=Role.RENTER  # ✅ FIXED: Use default role instead of user.role
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        logger.info(f"User registered successfully: {user.email}")
        return new_user

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")


@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": user.email, "role": user.role.value})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "mobile_number": user.mobile_number,
            "role": user.role.value
        }
    }


@router.get("/needs-setup")
def needs_setup(db: Session = Depends(get_db)):
    """Check if there are any Super Admins. If not, the system needs initial setup."""
    admin_exists = db.query(User).filter(User.role == Role.SUPER_ADMIN).first()
    return {"needs_setup": admin_exists is None}


@router.get("/seed-database")
def seed_database(db: Session = Depends(get_db)):
    """Temporary endpoint to seed database - DELETE AFTER FIRST USE"""
    from app.seed_data import seed_database

    try:
        seed_database()
        return {"message": "Database seeded successfully!"}
    except Exception as e:
        return {"error": str(e)}