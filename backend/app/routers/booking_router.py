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
import logging
logger = logging.getLogger(__name__)

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
    try:
        car = db.query(Car).filter(Car.id == booking.car_id).first()
        if not car:
            raise HTTPException(status_code=404, detail="Car not found")

        # Validate payment method
        valid_methods = ["cash", "gcash", "maya", "bank_transfer"]
        payment_method = booking.payment_method.lower() if booking.payment_method else "cash"
        if payment_method not in valid_methods:
            raise HTTPException(status_code=400, detail=f"Invalid payment method. Must be one of: {', '.join(valid_methods)}")

        db_booking = Booking(
            user_id=current_user.id,
            car_id=booking.car_id,
            start_date=booking.start_date,
            end_date=booking.end_date,
            payment_method=payment_method,
            status=BookingStatus.PENDING,
            created_at=datetime.utcnow()
        )
        db.add(db_booking)
        db.commit()
        db.refresh(db_booking)

        # Calculate total price
        days = (booking.end_date - booking.start_date).days
        total_price = max(1, days) * car.price_per_day

        return {
            "booking_id": db_booking.id,
            "total_price": total_price,
            "status": "pending",
            "message": "Booking created successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating booking: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create booking: {str(e)}")


@router.get("/notification-count")
def get_notification_count(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    count = 0
    if current_user.role in [Role.SUPER_ADMIN, Role.STAFF]:
        # Count pending bookings + recently cancelled bookings
        pending_count = db.query(Booking).filter(Booking.status == BookingStatus.PENDING).count()
        cancelled_count = db.query(Booking).filter(
            Booking.status.in_([BookingStatus.CANCELLED_USER, BookingStatus.CANCELLED_ADMIN])
        ).count()
        count = pending_count + cancelled_count
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

    if booking.status in [BookingStatus.CANCELLED_USER, BookingStatus.CANCELLED_ADMIN, BookingStatus.COMPLETED]:
        raise HTTPException(status_code=400, detail="Booking cannot be cancelled")

    if current_user.role == Role.RENTER:
        if booking.user_id != current_user.id: raise HTTPException(status_code=403, detail="Not authorized")

        # Allow cancellation if pending OR if within 3 minutes of start_date
        is_within_3_minutes = False
        if booking.start_date:
            minutes_diff = (booking.start_date - datetime.utcnow()).total_seconds() / 60
            is_within_3_minutes = abs(minutes_diff) <= 3

        if booking.status != BookingStatus.PENDING and not is_within_3_minutes:
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


@router.put("/{booking_id}/approve", dependencies=[Depends(require_role([Role.SUPER_ADMIN, Role.STAFF]))])
def approve_booking(booking_id: int, db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking: raise HTTPException(status_code=404, detail="Booking not found")
    if booking.status != BookingStatus.PENDING: raise HTTPException(status_code=400,
                                                                    detail="Only pending bookings can be approved")

    booking.status = BookingStatus.APPROVED
    booking.approved_at = datetime.utcnow()

    car = db.query(Car).filter(Car.id == booking.car_id).first()
    if car: car.status = CarStatus.RENTED

    db.commit()
    return {"message": "Booking approved"}


@router.put("/{booking_id}/disapprove", dependencies=[Depends(require_role([Role.SUPER_ADMIN, Role.STAFF]))])
def disapprove_booking(booking_id: int, reason: str = None, db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking: raise HTTPException(status_code=404, detail="Booking not found")
    if not reason: raise HTTPException(status_code=400, detail="Reason is required for disapproval")

    booking.status = BookingStatus.DISAPPROVED
    booking.cancellation_reason = reason
    db.commit()
    return {"message": "Booking disapproved"}


@router.put("/{booking_id}/complete", dependencies=[Depends(require_role([Role.SUPER_ADMIN, Role.STAFF]))])
def complete_booking(booking_id: int, db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking: raise HTTPException(status_code=404, detail="Booking not found")
    if booking.status != BookingStatus.APPROVED: raise HTTPException(status_code=400,
                                                                     detail="Only approved bookings can be marked as completed")

    booking.status = BookingStatus.COMPLETED
    car = db.query(Car).filter(Car.id == booking.car_id).first()
    if car: car.status = CarStatus.AVAILABLE

    db.commit()
    return {"message": "Booking marked as completed"}


@router.post("/feedback", response_model=FeedbackResponse)
def submit_feedback(feedback: FeedbackCreate, db: Session = Depends(get_db),
                    current_user: User = Depends(get_current_user)):
    booking = db.query(Booking).filter(Booking.id == feedback.booking_id).first()
    if not booking: raise HTTPException(status_code=404, detail="Booking not found")
    if booking.user_id != current_user.id: raise HTTPException(status_code=403, detail="Not authorized")
    if booking.status != BookingStatus.COMPLETED: raise HTTPException(status_code=400,
                                                                      detail="Can only provide feedback for completed bookings")
    existing_feedback = db.query(Feedback).filter(Feedback.booking_id == feedback.booking_id).first()
    if existing_feedback: raise HTTPException(status_code=400, detail="Feedback already submitted")

    db_feedback = Feedback(
        booking_id=feedback.booking_id,
        car_id=booking.car_id,
        rating=feedback.rating,
        comment=feedback.comment,
        created_at=datetime.utcnow()
    )
    db.add(db_feedback)
    db.commit()
    db.refresh(db_feedback)
    return db_feedback


@router.delete("/{booking_id}/feedback")
def delete_feedback(booking_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    feedback = db.query(Feedback).filter(Feedback.booking_id == booking_id).first()
    if not feedback: raise HTTPException(status_code=404, detail="Feedback not found")

    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if booking.user_id != current_user.id: raise HTTPException(status_code=403, detail="Not authorized")

    if feedback.created_at:
        hours_diff = (datetime.utcnow() - feedback.created_at).total_seconds() / 3600
        if hours_diff > 24:
            raise HTTPException(status_code=400, detail="Cannot edit feedback after 24 hours")

    db.delete(feedback)
    db.commit()
    return {"message": "Feedback deleted"}


@router.get("/{booking_id}/feedback", response_model=Optional[FeedbackResponse])
def get_feedback(booking_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    feedback = db.query(Feedback).filter(Feedback.booking_id == booking_id).first()
    if not feedback: return None
    return feedback


@router.get("/feedback/all")
def get_all_feedback(db: Session = Depends(get_db)):
    feedbacks = db.query(Feedback).options(
        joinedload(Feedback.booking).joinedload(Booking.user),
        joinedload(Feedback.booking).joinedload(Booking.car)
    ).order_by(Feedback.id.desc()).all()

    result = []
    for feedback in feedbacks:
        booking = feedback.booking
        car = booking.car if booking else None

        images_data = []
        if car and car.images:
            if isinstance(car.images, str):
                try:
                    images_data = json.loads(car.images)
                except:
                    images_data = []

        result.append({
            "id": feedback.id, "rating": feedback.rating, "comment": feedback.comment,
            "renter_name": booking.user.full_name if booking and booking.user else "Anonymous",
            "car_make": car.make if car else "Unknown", "car_model": car.model if car else "Unknown",
            "car_year": car.year if car else None, "car_image": images_data[0] if images_data else None,
            "created_date": booking.end_date if booking else None
        })
    return result


@router.delete("/{booking_id}")
def delete_booking(booking_id: int, db: Session = Depends(get_db),
                   current_user: User = Depends(get_current_user)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking: raise HTTPException(status_code=404, detail="Booking not found")

    # Check authorization
    if current_user.role == Role.RENTER:
        if booking.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized")
        # Renters can only delete their completed or cancelled bookings
        if booking.status not in [BookingStatus.COMPLETED, BookingStatus.CANCELLED_USER, BookingStatus.CANCELLED_ADMIN]:
            raise HTTPException(status_code=400, detail="Can only delete completed or cancelled bookings")
    elif current_user.role in [Role.SUPER_ADMIN, Role.STAFF]:
        # Admins can delete completed, cancelled, or disapproved bookings
        if booking.status not in [BookingStatus.COMPLETED, BookingStatus.CANCELLED_USER, BookingStatus.CANCELLED_ADMIN,
                                  BookingStatus.DISAPPROVED]:
            raise HTTPException(status_code=400, detail="Can only delete completed, cancelled, or disapproved bookings")
    else:
        raise HTTPException(status_code=403, detail="Not authorized")

    db.delete(booking)
    db.commit()
    return {"message": "Booking deleted successfully"}