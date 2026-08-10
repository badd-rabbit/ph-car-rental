from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from typing import List, Optional
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv
import os
import json

from app.database import get_db
from app.models import Car, CarStatus, CarType, FuelType
from app.schemas import CarCreate, CarUpdate, CarResponse
from app.auth import require_role, get_current_user, Role

load_dotenv()

router = APIRouter(prefix="/cars", tags=["Cars"])

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)


@router.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    """
    Upload image to Cloudinary and return the secure URL.
    This ensures images persist even after server restarts.
    """
    try:
        if not file:
            raise HTTPException(status_code=400, detail="No file provided")

        # Validate file type
        allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type. Allowed types: {', '.join(allowed_types)}"
            )

        # Upload to Cloudinary
        upload_result = cloudinary.uploader.upload(
            file.file,
            folder="ph_car_rental",
            resource_type="image",
            use_filename=True,
            unique_filename=True
        )

        return {
            "url": upload_result["secure_url"],
            "public_id": upload_result["public_id"]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.get("/", response_model=List[CarResponse])
def get_cars(
        car_type: Optional[str] = None,
        fuel_type: Optional[str] = None,
        db: Session = Depends(get_db)
):
    """
    Get all cars with optional filtering by car_type and fuel_type.
    """
    query = db.query(Car)

    if car_type:
        query = query.filter(Car.car_type == car_type)
    if fuel_type:
        query = query.filter(Car.fuel_type == fuel_type)

    cars = query.all()
    return cars


@router.post("/", response_model=CarResponse)
def create_car(
        car: CarCreate,
        db: Session = Depends(get_db),
        current_user=Depends(require_role([Role.SUPER_ADMIN]))
):
    """
    Create a new car (Super Admin only).
    Images should be uploaded first via /upload-image endpoint,
    then pass the URLs as a JSON array in the 'images' field.
    """
    # Handle images field - ensure it's stored as JSON string in database
    images_data = car.images if car.images else []
    if isinstance(images_data, list):
        images_data = json.dumps(images_data)

    db_car = Car(
        make=car.make,
        model=car.model,
        year=car.year,
        color=car.color,
        seat_number=car.seat_number,
        price_per_day=car.price_per_day,
        car_type=car.car_type,
        fuel_type=car.fuel_type,
        images=images_data,
        status=CarStatus.AVAILABLE
    )

    db.add(db_car)
    db.commit()
    db.refresh(db_car)
    return db_car


@router.get("/{car_id}", response_model=CarResponse)
def get_car(
        car_id: int,
        db: Session = Depends(get_db)
):
    """
    Get a specific car by ID.
    """
    car = db.query(Car).filter(Car.id == car_id).first()
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")
    return car


@router.put("/{car_id}", response_model=CarResponse)
def update_car(
        car_id: int,
        car: CarUpdate,
        db: Session = Depends(get_db),
        current_user=Depends(require_role([Role.SUPER_ADMIN]))
):
    """
    Update car information (Super Admin only).
    """
    db_car = db.query(Car).filter(Car.id == car_id).first()
    if not db_car:
        raise HTTPException(status_code=404, detail="Car not found")

    # Update fields
    update_data = car.dict(exclude_unset=True)

    # Handle images if provided
    if "images" in update_data:
        images_data = update_data["images"]
        if isinstance(images_data, list):
            update_data["images"] = json.dumps(images_data)

    for field, value in update_data.items():
        setattr(db_car, field, value)

    db.commit()
    db.refresh(db_car)
    return db_car


@router.delete("/{car_id}")
def delete_car(
        car_id: int,
        db: Session = Depends(get_db),
        current_user=Depends(require_role([Role.SUPER_ADMIN]))
):
    """
    Delete a car (Super Admin only).
    """
    car = db.query(Car).filter(Car.id == car_id).first()
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")

    db.delete(car)
    db.commit()
    return {"message": "Car deleted successfully"}


@router.put("/{car_id}/status")
def update_car_status(
        car_id: int,
        status: CarStatus,
        db: Session = Depends(get_db),
        current_user=Depends(require_role([Role.SUPER_ADMIN, Role.STAFF]))
):
    """
    Update car status (Admin/Staff only).
    """
    car = db.query(Car).filter(Car.id == car_id).first()
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")

    car.status = status
    db.commit()
    db.refresh(car)
    return {"message": f"Car status updated to {status.value}"}