from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import User, Role
from app.schemas import UserUpdate, PasswordChange, UserResponse, StaffCreate
from app.auth import get_current_user, get_password_hash, verify_password, require_role

router = APIRouter(prefix="/users", tags=["Users"])


@router.put("/profile", response_model=UserResponse)
def update_profile(user_update: UserUpdate, db: Session = Depends(get_db),
                   current_user: User = Depends(get_current_user)):
    db_user = db.query(User).filter(User.email == user_update.email).first()
    if db_user and db_user.id != current_user.id:
        raise HTTPException(status_code=400, detail="Email already registered by another user")

    current_user.full_name = user_update.full_name
    current_user.mobile_number = user_update.mobile_number
    current_user.email = user_update.email

    db.commit()
    db.refresh(current_user)
    return current_user


@router.put("/change-password")
def change_password(password_data: PasswordChange, db: Session = Depends(get_db),
                    current_user: User = Depends(get_current_user)):
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect current password")

    current_user.hashed_password = get_password_hash(password_data.new_password)
    db.commit()
    return {"message": "Password changed successfully"}


# NEW: Get all Staff and Admins (Super Admin only)
@router.get("/staff", response_model=List[UserResponse], dependencies=[Depends(require_role([Role.SUPER_ADMIN]))])
def get_staff_and_admins(db: Session = Depends(get_db)):
    users = db.query(User).filter(User.role.in_([Role.SUPER_ADMIN, Role.STAFF])).all()
    return users


# NEW: Add new Staff member (Super Admin only)
@router.post("/add-staff", response_model=UserResponse, dependencies=[Depends(require_role([Role.SUPER_ADMIN]))])
def add_staff(user: StaffCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = get_password_hash(user.password)
    new_user = User(
        email=user.email,
        full_name=user.full_name,
        mobile_number=user.mobile_number,
        hashed_password=hashed_password,
        role=Role.STAFF  # Hardcoded to STAFF role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user