from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, Enum, Text, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base

class Role(str, enum.Enum):
    SUPER_ADMIN = "super_admin"
    STAFF = "staff"
    RENTER = "renter"

class BookingStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    DISAPPROVED = "disapproved"
    CANCELLED_USER = "cancelled_user"
    CANCELLED_ADMIN = "cancelled_admin"
    COMPLETED = "completed"

class PaymentMethod(str, enum.Enum):
    CASH = "cash"
    GCASH = "gcash"
    MAYA = "maya"
    BANK_TRANSFER = "bank_transfer"

class CarType(str, enum.Enum):
    SUV = "SUV"
    PICKUP = "Pickup"
    SEDAN = "Sedan"
    VAN = "Van"
    SPORTS = "Sports"

class FuelType(str, enum.Enum):
    GASOLINE = "Gasoline"
    DIESEL = "Diesel"
    HYBRID = "Hybrid"
    ELECTRIC = "Electric"

class CarStatus(str, enum.Enum):
    AVAILABLE = "available"
    RENTED = "rented"
    MAINTENANCE = "maintenance"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    mobile_number = Column(String)
    role = Column(Enum(Role), default=Role.RENTER)
    bookings = relationship("Booking", back_populates="user")

class Car(Base):
    __tablename__ = "cars"
    id = Column(Integer, primary_key=True, index=True)
    make = Column(String)
    model = Column(String)
    year = Column(Integer)
    color = Column(String)
    seat_number = Column(Integer)
    price_per_day = Column(Float)
    images = Column(Text)
    car_type = Column(Enum(CarType), default=CarType.SEDAN)
    fuel_type = Column(Enum(FuelType), default=FuelType.GASOLINE)
    status = Column(Enum(CarStatus), default=CarStatus.AVAILABLE)
    bookings = relationship("Booking", back_populates="car")
    feedbacks = relationship("Feedback", back_populates="car")

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    car_id = Column(Integer, ForeignKey("cars.id"))
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    status = Column(Enum(BookingStatus), default=BookingStatus.PENDING)
    payment_method = Column(String)
    total_price = Column(Float, nullable=True)  # Make sure this exists
    cancellation_reason = Column(String, nullable=True)
    approved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, nullable=True, default=datetime.utcnow)  # Make sure this exists

    # Relationships
    user = relationship("User", back_populates="bookings")
    car = relationship("Car", back_populates="bookings")
    feedback = relationship("Feedback", back_populates="booking", uselist=False)

class Feedback(Base):
    __tablename__ = "feedbacks"
    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), unique=True)
    car_id = Column(Integer, ForeignKey("cars.id"))
    rating = Column(Integer)
    comment = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)  # NEW FIELD
    booking = relationship("Booking", back_populates="feedback")
    car = relationship("Car", back_populates="feedbacks")