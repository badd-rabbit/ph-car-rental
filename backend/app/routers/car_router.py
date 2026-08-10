from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv
import os
import json
import logging

from app.database import get_db
from app.models import Car, CarStatus
from app.schemas import CarCreate, CarUpdate, CarResponse
from app.auth import require_role, Role

load_dotenv()
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/cars", tags=["Cars"])

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)


@router.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    try:
        if not file:
            raise HTTPException(status_code=400, detail="No file provided")

        allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
        if file.content_type not in allowed_types:
            raise HTTPException(status_code=400, detail=f"Invalid file type. Allowed: {', '.join(allowed_types)}")

        upload_result = cloudinary.uploader.upload(
            file.file,
            folder="ph_car_rental",
            resource_type="image",
            use_filename=True,
            unique_filename=True
        )

        return {"url": upload_result["secure_url"], "public_id": upload_result["public_id"]}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Cloudinary upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.get("/", response_model=List[CarResponse])
def get_cars(
        car_type: Optional[str] = None,
        fuel_type: Optional[str] = None,
        db: Session = Depends(get_db)
):
    query = db.query(Car)
    if car_type:
        query = query.filter(Car.car_type == car_type)
    if fuel_type:
        query = query.filter(Car.fuel_type == fuel_type)
    return query.all()


@router.post("/", response_model=CarResponse)
def create_car(
        car: CarCreate,
        db: Session = Depends(get_db),
        current_user=Depends(require_role([Role.SUPER_ADMIN]))
):
    try:
        # Convert images list to JSON string for database storage
        images_json = json.dumps(car.images) if car.images else "[]"

        db_car = Car(
            make=car.make,
            model=car.model,
            year=car.year,
            color=car.color,
            seat_number=car.seat_number,
            price_per_day=car.price_per_day,
            car_type=car.car_type,
            fuel_type=car.fuel_type,
            images=images_json,
            status=CarStatus.AVAILABLE
        )

        db.add(db_car)
        db.commit()
        db.refresh(db_car)
        return db_car
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating car: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create car: {str(e)}")


@router.get("/{car_id}", response_model=CarResponse)
def get_car(car_id: int, db: Session = Depends(get_db)):
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
    db_car = db.query(Car).filter(Car.id == car_id).first()
    if not db_car:
        raise HTTPException(status_code=404, detail="Car not found")

    try:
        update_data = car.dict(exclude_unset=True)

        # Handle images conversion if provided
        if "images" in update_data:
            update_data["images"] = json.dumps(update_data["images"]) if update_data["images"] else "[]"

        for field, value in update_data.items():
            setattr(db_car, field, value)

        db.commit()
        db.refresh(db_car)
        return db_car
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating car: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update car: {str(e)}")


@router.delete("/{car_id}")
def delete_car(
        car_id: int,
        db: Session = Depends(get_db),
        current_user=Depends(require_role([Role.SUPER_ADMIN]))
):
    car = db.query(Car).filter(Car.id == car_id).first()
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")

    db.delete(car)
    db.commit()
    return {"message": "Car deleted successfully"}