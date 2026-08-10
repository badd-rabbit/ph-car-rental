from pydantic import BaseModel, EmailStr, Field, model_validator
from typing import Optional, List, Any
from datetime import datetime
import json

# ========== USER SCHEMAS ==========
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    mobile_number: str

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    mobile_number: Optional[str] = None
    email: Optional[EmailStr] = None

class PasswordChange(BaseModel):
    old_password: str
    new_password: str

class UserResponse(UserBase):
    id: int
    role: str

    class Config:
        from_attributes = True

class StaffCreate(UserBase):
    password: str
    role: str = "staff"

# ========== AUTH SCHEMAS ==========
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# ========== CAR SCHEMAS ==========
class CarCreate(BaseModel):
    make: str
    model: str
    year: int
    color: str
    seat_number: int
    price_per_day: float
    car_type: str
    fuel_type: str
    images: Optional[List[str]] = []

class CarUpdate(BaseModel):
    make: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    color: Optional[str] = None
    seat_number: Optional[int] = None
    price_per_day: Optional[float] = None
    car_type: Optional[str] = None
    fuel_type: Optional[str] = None
    images: Optional[List[str]] = None
    status: Optional[str] = None

class CarResponse(BaseModel):
    id: int
    make: str
    model: str
    year: int
    color: str
    seat_number: int
    price_per_day: float
    car_type: str
    fuel_type: str
    images: Any
    status: str
    average_rating: float = 0.0
    review_count: int = 0

    @model_validator(mode='before')
    @classmethod
    def parse_images(cls, data: Any) -> Any:
        if isinstance(data, dict):
            images = data.get("images")
            if isinstance(images, str):
                try:
                    data["images"] = json.loads(images)
                except json.JSONDecodeError:
                    data["images"] = []
            elif images is None:
                data["images"] = []
        return data

    class Config:
        from_attributes = True

# ========== BOOKING SCHEMAS ==========
class BookingCreate(BaseModel):
    car_id: int
    start_date: datetime
    end_date: datetime
    payment_method: str

class BookingResponse(BaseModel):
    id: int
    car_id: int
    user_id: int
    start_date: datetime
    end_date: datetime
    status: str
    payment_method: str
    total_price: Optional[float] = None
    cancellation_reason: Optional[str] = None
    approved_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class BookingWithCarResponse(BookingResponse):
    car: CarResponse
    user: Optional[UserResponse] = None

# ========== FEEDBACK SCHEMAS ==========
class FeedbackCreate(BaseModel):
    booking_id: int
    rating: int
    comment: Optional[str] = None

class FeedbackResponse(BaseModel):
    id: int
    booking_id: int
    car_id: int
    rating: int
    comment: Optional[str]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True