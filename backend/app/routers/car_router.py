from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
import json
import os
import uuid
from app.database import get_db
from app.models import Car, Role, Feedback, CarType, FuelType, CarStatus
from app.schemas import CarCreate, CarResponse, CarUpdate
from app.auth import require_role

router = APIRouter(prefix="/cars", tags=["Cars"])

# Allowed file types and max size (5MB)
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


def get_uploads_dir():
    return os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")


# Upload endpoint - must be defined BEFORE other routes with {car_id}
@router.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    # Validate file type
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}")

    # Validate file size
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 5MB")

    # Generate unique filename
    unique_filename = f"{uuid.uuid4().hex}{file_ext}"
    uploads_dir = get_uploads_dir()
    os.makedirs(uploads_dir, exist_ok=True)
    file_path = os.path.join(uploads_dir, unique_filename)

    # Save file
    with open(file_path, "wb") as f:
        f.write(content)

    # Return accessible URL
    file_url = f"/uploads/{unique_filename}"
    return {"url": file_url, "filename": unique_filename}


@router.get("/", response_model=List[CarResponse])
def get_cars(
        car_type: Optional[str] = Query(None),
        fuel_type: Optional[str] = Query(None),
        db: Session = Depends(get_db)
):
    query = db.query(Car)

    if car_type:
        query = query.filter(Car.car_type == car_type)
    if fuel_type:
        query = query.filter(Car.fuel_type == fuel_type)

    cars = query.all()
    result = []
    for car in cars:
        feedbacks = db.query(Feedback).filter(Feedback.car_id == car.id).all()
        avg_rating = sum(f.rating for f in feedbacks) / len(feedbacks) if feedbacks else 0.0
        review_count = len(feedbacks)

        images_data = car.images
        if isinstance(images_data, str):
            try:
                images_data = json.loads(images_data)
            except:
                images_data = []

        result.append({
            "id": car.id,
            "make": car.make,
            "model": car.model,
            "year": car.year,
            "color": car.color,
            "seat_number": car.seat_number,
            "price_per_day": car.price_per_day,
            "images": images_data,
            "car_type": car.car_type.value if hasattr(car.car_type, 'value') else car.car_type,
            "fuel_type": car.fuel_type.value if hasattr(car.fuel_type, 'value') else car.fuel_type,
            "status": car.status.value if hasattr(car.status, 'value') else car.status,
            "average_rating": avg_rating,
            "review_count": review_count
        })
    return result


@router.post("/", response_model=CarResponse, dependencies=[Depends(require_role([Role.SUPER_ADMIN]))])
def create_car(car: CarCreate, db: Session = Depends(get_db)):
    db_car = Car(
        make=car.make, model=car.model, year=car.year, color=car.color,
        seat_number=car.seat_number, price_per_day=car.price_per_day,
        images=json.dumps(car.images),
        car_type=car.car_type,
        fuel_type=car.fuel_type,
        status=CarStatus.AVAILABLE
    )
    db.add(db_car)
    db.commit()
    db.refresh(db_car)

    return {
        "id": db_car.id, "make": db_car.make, "model": db_car.model, "year": db_car.year,
        "color": db_car.color, "seat_number": db_car.seat_number, "price_per_day": db_car.price_per_day,
        "images": car.images, "car_type": db_car.car_type, "fuel_type": db_car.fuel_type,
        "status": db_car.status, "average_rating": 0.0, "review_count": 0
    }


@router.put("/{car_id}", response_model=CarResponse, dependencies=[Depends(require_role([Role.SUPER_ADMIN]))])
def update_car(car_id: int, car: CarUpdate, db: Session = Depends(get_db)):
    db_car = db.query(Car).filter(Car.id == car_id).first()
    if not db_car:
        raise HTTPException(status_code=404, detail="Car not found")

    for key, value in car.dict(exclude_unset=True).items():
        if key == 'images' and value is not None:
            setattr(db_car, key, json.dumps(value))
        else:
            setattr(db_car, key, value)

    db.commit()
    db.refresh(db_car)

    feedbacks = db.query(Feedback).filter(Feedback.car_id == db_car.id).all()
    avg_rating = sum(f.rating for f in feedbacks) / len(feedbacks) if feedbacks else 0.0

    images_data = db_car.images
    if isinstance(images_data, str):
        try:
            images_data = json.loads(images_data)
        except:
            images_data = []

    return {
        "id": db_car.id, "make": db_car.make, "model": db_car.model, "year": db_car.year,
        "color": db_car.color, "seat_number": db_car.seat_number, "price_per_day": db_car.price_per_day,
        "images": images_data, "car_type": db_car.car_type, "fuel_type": db_car.fuel_type,
        "status": db_car.status, "average_rating": avg_rating, "review_count": len(feedbacks)
    }


@router.delete("/{car_id}", dependencies=[Depends(require_role([Role.SUPER_ADMIN]))])
def delete_car(car_id: int, db: Session = Depends(get_db)):
    db_car = db.query(Car).filter(Car.id == car_id).first()
    if not db_car:
        raise HTTPException(status_code=404, detail="Car not found")

    from app.models import Booking, BookingStatus
    active_bookings = db.query(Booking).filter(
        Booking.car_id == car_id,
        Booking.status.in_([BookingStatus.PENDING, BookingStatus.APPROVED])
    ).first()

    if active_bookings:
        raise HTTPException(status_code=400, detail="Cannot delete car with active bookings")

    # Delete associated images
    images_data = db_car.images
    if isinstance(images_data, str):
        try:
            images_data = json.loads(images_data)
        except:
            images_data = []

    uploads_dir = get_uploads_dir()
    for img_url in images_data:
        if img_url.startswith("/uploads/"):
            filename = img_url.replace("/uploads/", "")
            file_path = os.path.join(uploads_dir, filename)
            if os.path.exists(file_path):
                os.remove(file_path)

    db.delete(db_car)
    db.commit()
    return {"message": "Car deleted successfully"}