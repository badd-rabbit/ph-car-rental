from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
import json
from datetime import datetime
from app.database import get_db
from app.models import Booking, User, Role, BookingStatus, Feedback, Car, CarStatus
from app.schemas import BookingCreate, FeedbackCreate, FeedbackResponse
from app.auth import get_current_user, require_role
from app.services.payment_strategy import PaymentContext, CashStrategy, GCashStrategy, MayaStrategy, \
    BankTransferStrategy

router = APIRouter(prefix="/bookings", tags=["Bookings"])


def get_payment_strategy(method):
    strategies = {
        "cash": CashStrategy(), "gcash": GCashStrategy(),
        "maya": MayaStrategy(), "bank_transfer": BankTransferStrategy()
    }
    return strategies.get(method, CashStrategy())


def serialize_car(car):
    if not car: return None
    images_data = car.images
    if isinstance(images_data, str):
        try:
            images_data = json.loads(images_data)
        except:
            images_data = []

    car_type_val = car.car_type
    if hasattr(car_type_val, 'value'): car_type_val = car_type_val.value

    fuel_type_val = car.fuel_type
    if hasattr(fuel_type_val, 'value'): fuel_type_val = fuel_type_val.value

    return {
        "id": car.id, "make": car.make, "model": car.model, "year": car.year,
        "color": car.color, "seat_number": car.seat_number, "price_per_day": car.price_per_day,
        "images": images_data, "car_type": car_type_val, "fuel_type": fuel_type_val,
        "average_rating": 0.0, "review_count": 0
    }


@router.post("/", response_model=dict)
def create_booking(booking: BookingCreate, db: Session = Depends(get_db),
                   current_user: User = Depends(get_current_user)):
    car = db.query(Car).filter(Car.id == booking.car_id).first()
    if not car: raise HTTPException(status_code=404, detail="Car not found")

    db_booking = Booking(
        user_id=current_user.id, car_id=booking.car_id,
        start_date=booking.start_date, end_date=booking.end_date,
        payment_method=booking.payment_method, status=BookingStatus.PENDING,
        created_at=datetime.utcnow()  # Ensure created_at is set
    )
    db.add(db_booking)
    db.commit()

    strategy = get_payment_strategy(booking.payment_method.value)
    context = PaymentContext(strategy)
    payment_result = context.execute_payment(1000.0)

    return {"booking_id": db_booking.id, "payment_details": payment_result}


@router.get("/notification-count")
def get_notification_count(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    count = 0
    if current_user.role in [Role.SUPER_ADMIN, Role.STAFF]:
        count = db.query(Booking).filter(Booking.status == BookingStatus.PENDING).count()
    elif current_user.role == Role.RENTER:
        count = db.query(Booking).filter(
            Booking.user_id == current_user.id,
            Booking.status.in_([BookingStatus.APPROVED, BookingStatus.DISAPPROVED])
        ).count()
    return {"count": count}


@router.get("/my-bookings")
def get_my_bookings(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        bookings = db.query(Booking).options(joinedload(Booking.car)).filter(
            Booking.user_id == current_user.id).order_by(Booking.start_date.desc()).all()
        result = []
        for booking in bookings:
            feedback = db.query(Feedback).filter(Feedback.booking_id == booking.id).first()
            feedback_dict = None
            if feedback:
                feedback_dict = {
                    "rating": feedback.rating,
                    "comment": feedback.comment,
                    "created_at": feedback.created_at
                }

            status_val = booking.status.value if hasattr(booking.status, 'value') else booking.status
            payment_val = booking.payment_method.value if hasattr(booking.payment_method,
                                                                  'value') else booking.payment_method

            days = (booking.end_date - booking.start_date).days
            total_price = max(1, days) * booking.car.price_per_day if booking.car else 0

            result.append({
                "id": booking.id, "car_id": booking.car_id,
                "start_date": booking.start_date, "end_date": booking.end_date,
                "status": status_val, "payment_method": payment_val,
                "total_price": total_price,
                "created_at": booking.created_at,  # ADDED for 3-minute timer
                "cancellation_reason": booking.cancellation_reason,
                "approved_at": booking.approved_at,
                "car": serialize_car(booking.car), "feedback": feedback_dict,
                "user": {
                    "id": current_user.id,
                    "email": current_user.email,
                    "full_name": current_user.full_name,
                    "mobile_number": current_user.mobile_number
                }
            })
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/admin/all", dependencies=[Depends(require_role([Role.SUPER_ADMIN, Role.STAFF]))])
def get_all_bookings(db: Session = Depends(get_db)):
    bookings = db.query(Booking).options(joinedload(Booking.car), joinedload(Booking.user)).order_by(
        Booking.start_date.desc()).all()
    result = []
    for booking in bookings:
        feedback = db.query(Feedback).filter(Feedback.booking_id == booking.id).first()
        feedback_dict = None
        if feedback:
            feedback_dict = {
                "rating": feedback.rating,
                "comment": feedback.comment,
                "created_at": feedback.created_at
            }

        status_val = booking.status.value if hasattr(booking.status, 'value') else booking.status
        payment_val = booking.payment_method.value if hasattr(booking.payment_method,
                                                              'value') else booking.payment_method

        days = (booking.end_date - booking.start_date).days
        total_price = max(1, days) * booking.car.price_per_day if booking.car else 0

        result.append({
            "id": booking.id, "car_id": booking.car_id,
            "user_id": booking.user_id,
            "renter_name": booking.user.full_name if booking.user else "Unknown",
            "renter_email": booking.user.email if booking.user else "Unknown",
            "renter_mobile_number": booking.user.mobile_number if booking.user else "N/A",
            "start_date": booking.start_date, "end_date": booking.end_date,
            "status": status_val, "payment_method": payment_val,
            "total_price": total_price,
            "created_at": booking.created_at,
            "cancellation_reason": booking.cancellation_reason,
            "approved_at": booking.approved_at,
            "car": serialize_car(booking.car), "feedback": feedback_dict,
            "user": {
                "id": booking.user.id if booking.user else None,
                "email": booking.user.email if booking.user else "N/A",
                "full_name": booking.user.full_name if booking.user else "N/A",
                "mobile_number": booking.user.mobile_number if booking.user else "N/A"
            }
        })
    return result


@router.put("/{booking_id}/cancel")
def cancel_booking(booking_id: int, reason: str = None, db: Session = Depends(get_db),
                   current_user: User = Depends(get_current_user)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking: raise HTTPException(status_code=404, detail="Booking not found")

    # Allow cancellation if within 3 minutes of creation, regardless of status (except completed/cancelled)
    is_within_3_minutes = False
    if booking.created_at:
        minutes_diff = (datetime.utcnow() - booking.created_at).total_seconds() / 60
        is_within_3_minutes = minutes_diff <= 3

    if booking.status in [BookingStatus.CANCELLED_USER, BookingStatus.CANCELLED_ADMIN, BookingStatus.COMPLETED]:
        if not is_within_3_minutes:
            raise HTTPException(status_code=400, detail="Booking cannot be cancelled")

    if current_user.role == Role.RENTER:
        if booking.user_id != current_user.id: raise HTTPException(status_code=403, detail="Not authorized")

        # Enforce 3-minute limit for renters
        if not is_within_3_minutes:
            raise HTTPException(status_code=400, detail="Cancellation period (3 minutes) has expired")

        booking.status = BookingStatus.CANCELLED_USER
        if reason: booking.cancellation_reason = reason
    elif current_user.role in [Role.SUPER_ADMIN, Role.STAFF]:
        if not reason: raise HTTPException(status_code=400, detail="Reason required for admin cancellation")
        booking.status = BookingStatus.CANCELLED_ADMIN
        booking.cancellation_reason = reason
    else:
        raise HTTPException(status_code=403, detail="Not authorized")

    car = db.query(Car).filter(Car.id == booking.car_id).first()
    if car and car.status == CarStatus.RENTED: car.status = CarStatus.AVAILABLE

    db.commit()
    return {"message": "Booking cancelled"}

# ... (Keep the rest of the file the same: approve, disapprove, complete, feedback endpoints)