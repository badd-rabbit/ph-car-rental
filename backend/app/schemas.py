from pydantic import BaseModel, EmailStr, field_validator, ConfigDict
from typing import List, Optional
from datetime import datetime
from app.models import Role, BookingStatus, PaymentMethod, CarType, FuelType, CarStatus


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    mobile_number: str


class UserCreate(UserBase):
    password: str
    role: Role = Role.RENTER


class UserResponse(UserBase):
    id: int
    role: Role
    model_config = ConfigDict(from_attributes=True)


class StaffCreate(BaseModel):
    email: EmailStr
    full_name: str
    mobile_number: str
    password: str


class UserUpdate(BaseModel):
    full_name: str
    mobile_number: str
    email: EmailStr


class PasswordChange(BaseModel):
    current_password: str
    new_password: str

    @field_validator('new_password')
    @classmethod
    def password_min_length(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters long')
        return v


class CarBase(BaseModel):
    make: str
    model: str
    year: int
    color: str
    seat_number: int
    price_per_day: float
    car_type: CarType = CarType.SEDAN
    fuel_type: FuelType = FuelType.GASOLINE


class CarCreate(CarBase):
    images: List[str]

    @field_validator('images')
    @classmethod
    def validate_images(cls, v):
        if len(v) > 8:
            raise ValueError('Maximum 8 photos allowed')
        return v


class CarUpdate(CarBase):
    images: Optional[List[str]] = None
    status: Optional[CarStatus] = None


class CarResponse(CarBase):
    id: int
    images: List[str]
    status: CarStatus
    average_rating: float = 0.0
    review_count: int = 0
    model_config = ConfigDict(from_attributes=True)


class BookingCreate(BaseModel):
    car_id: int
    start_date: datetime
    end_date: datetime
    payment_method: PaymentMethod

    @field_validator('start_date')
    @classmethod
    def start_date_must_be_future(cls, v):
        if v.tzinfo is not None:
            v_naive = v.replace(tzinfo=None)
        else:
            v_naive = v
        now_naive = datetime.now()
        if v_naive <= now_naive:
            raise ValueError('Start date cannot be in the past')
        return v

    @field_validator('end_date')
    @classmethod
    def end_date_must_be_after_start(cls, v, info):
        if v.tzinfo is not None:
            v_naive = v.replace(tzinfo=None)
        else:
            v_naive = v
        if 'start_date' in info.data:
            start = info.data['start_date']
            if start.tzinfo is not None:
                start_naive = start.replace(tzinfo=None)
            else:
                start_naive = start
            if v_naive <= start_naive:
                raise ValueError('End date must be after start date')
        return v


class BookingResponse(BaseModel):
    id: int
    car_id: int
    user_id: int
    start_date: datetime
    end_date: datetime
    status: BookingStatus
    payment_method: PaymentMethod
    cancellation_reason: Optional[str]
    model_config = ConfigDict(from_attributes=True)


class CarInBooking(BaseModel):
    id: int
    make: str
    model: str
    year: int
    color: str
    seat_number: int
    price_per_day: float
    images: List[str] = []
    car_type: CarType
    fuel_type: FuelType
    average_rating: float = 0.0
    review_count: int = 0
    model_config = ConfigDict(from_attributes=True)


class FeedbackDetails(BaseModel):
    rating: int
    comment: str
    created_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


class BookingWithCarResponse(BaseModel):
    id: int
    car_id: int
    user_id: Optional[int] = None
    renter_name: Optional[str] = None
    renter_email: Optional[str] = None
    start_date: datetime
    end_date: datetime
    status: BookingStatus
    payment_method: PaymentMethod
    cancellation_reason: Optional[str]
    approved_at: Optional[datetime] = None
    car: Optional[CarInBooking] = None
    feedback: Optional[FeedbackDetails] = None
    model_config = ConfigDict(from_attributes=True)


class FeedbackCreate(BaseModel):
    booking_id: int
    rating: int
    comment: str

    @field_validator('rating')
    @classmethod
    def rating_must_be_1_to_5(cls, v):
        if v < 1 or v > 5:
            raise ValueError('Rating must be between 1 and 5')
        return v


class FeedbackResponse(BaseModel):
    id: int
    booking_id: int
    car_id: int
    rating: int
    comment: str
    model_config = ConfigDict(from_attributes=True)