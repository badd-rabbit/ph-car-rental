from pydantic import BaseModel, Field, model_validator
from typing import Optional, List, Any
from datetime import datetime
from enum import Enum
import json

# ... (keep your User, Booking, etc. schemas as they are) ...

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
    images: Any  # We will parse this in the validator
    status: str
    average_rating: float = 0.0
    review_count: int = 0

    class BookingCreate(BaseModel):
        car_id: int
        start_date: datetime
        end_date: datetime
        payment_method: str

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

    @model_validator(mode='before')
    @classmethod
    def parse_images(cls, data: Any) -> Any:
        # Automatically convert JSON string from DB into a Python List
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