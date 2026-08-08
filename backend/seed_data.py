import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, Base, SessionLocal
from app.models import Car, User, Role, CarType, FuelType, CarStatus
from app.auth import get_password_hash
from datetime import datetime


def seed_database():
    print("🗑️  Cleaning database...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # 1. Create Users
        print("👤 Creating users...")
        admin = User(
            email="admin@phcarrental.com",
            full_name="Homer Darang",
            mobile_number="09123456789",
            hashed_password=get_password_hash("admin123"),
            role=Role.SUPER_ADMIN
        )
        renter = User(
            email="renter@test.com",
            full_name="Juan Dela Cruz",
            mobile_number="09987654321",
            hashed_password=get_password_hash("renter123"),
            role=Role.RENTER
        )
        db.add_all([admin, renter])
        db.commit()

        # 2. Create Realistic PH Cars
        print("🚗 Seeding cars...")
        cars_data = [
            {
                "make": "Toyota", "model": "Vios", "year": 2023, "color": "White",
                "seat_number": 5, "price_per_day": 2500.00,
                "car_type": CarType.SEDAN, "fuel_type": FuelType.GASOLINE,
                "status": CarStatus.AVAILABLE,
                "images": [
                    "https://images.unsplash.com/photo-1621007947382-bb3c3968e3bb?auto=format&fit=crop&w=800&q=80"]
            },
            {
                "make": "Toyota", "model": "Innova", "year": 2023, "color": "Silver",
                "seat_number": 7, "price_per_day": 3500.00,
                "car_type": CarType.SUV, "fuel_type": FuelType.DIESEL,
                "status": CarStatus.AVAILABLE,
                "images": [
                    "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80"]
            },
            {
                "make": "Mitsubishi", "model": "Xpander", "year": 2024, "color": "Red",
                "seat_number": 7, "price_per_day": 3200.00,
                "car_type": CarType.SUV, "fuel_type": FuelType.GASOLINE,
                "status": CarStatus.AVAILABLE,
                "images": ["https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80"]
            },
            {
                "make": "Honda", "model": "Civic", "year": 2023, "color": "Black",
                "seat_number": 5, "price_per_day": 3000.00,
                "car_type": CarType.SEDAN, "fuel_type": FuelType.GASOLINE,
                "status": CarStatus.AVAILABLE,
                "images": [
                    "https://images.unsplash.com/photo-1606611013016-969c19ba27a5?auto=format&fit=crop&w=800&q=80"]
            },
            {
                "make": "Ford", "model": "Ranger", "year": 2023, "color": "Blue",
                "seat_number": 5, "price_per_day": 4000.00,
                "car_type": CarType.PICKUP, "fuel_type": FuelType.DIESEL,
                "status": CarStatus.AVAILABLE,
                "images": ["https://images.unsplash.com/photo-1551830820-330a71b99659?auto=format&fit=crop&w=800&q=80"]
            },
            {
                "make": "Hyundai", "model": "Santa Fe", "year": 2024, "color": "White",
                "seat_number": 7, "price_per_day": 4500.00,
                "car_type": CarType.SUV, "fuel_type": FuelType.DIESEL,
                "status": CarStatus.AVAILABLE,
                "images": [
                    "https://images.unsplash.com/photo-1568844293986-8d0400f4745b?auto=format&fit=crop&w=800&q=80"]
            },
            {
                "make": "Toyota", "model": "HiAce", "year": 2023, "color": "White",
                "seat_number": 12, "price_per_day": 5500.00,
                "car_type": CarType.VAN, "fuel_type": FuelType.DIESEL,
                "status": CarStatus.AVAILABLE,
                "images": ["https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=800&q=80"]
            }
        ]

        cars = []
        for data in cars_data:
            car = Car(**data)
            cars.append(car)

        db.add_all(cars)
        db.commit()

        print("✅ Database seeded successfully!")
        print(f"   - 2 Users created (admin@phcarrental.com / renter@test.com)")
        print(f"   - {len(cars)} Cars added to fleet")

    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()