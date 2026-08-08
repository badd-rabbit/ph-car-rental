from app.database import SessionLocal
from app.models import Car, User, Role, CarType, FuelType, CarStatus
from app.auth import get_password_hash


def seed_database():
    db = SessionLocal()

    try:
        # Check if already seeded
        if db.query(User).filter(User.role == Role.SUPER_ADMIN).first():
            return {"message": "Database already seeded"}

        # Create admin
        admin = User(
            email="admin@phcarrental.com",
            full_name="Homer Darang",
            mobile_number="09123456789",
            hashed_password=get_password_hash("admin123"),
            role=Role.SUPER_ADMIN
        )
        db.add(admin)
        db.commit()

        # Add cars (same data as before)
        cars_data = [
            {"make": "Toyota", "model": "Vios", "year": 2023, "color": "White", "seat_number": 5,
             "price_per_day": 2500.00, "car_type": CarType.SEDAN, "fuel_type": FuelType.GASOLINE,
             "status": CarStatus.AVAILABLE, "images": [
                "https://images.unsplash.com/photo-1621007947382-bb3c3968e3bb?auto=format&fit=crop&w=800&q=80"]},
            {"make": "Toyota", "model": "Innova", "year": 2023, "color": "Silver", "seat_number": 7,
             "price_per_day": 3500.00, "car_type": CarType.SUV, "fuel_type": FuelType.DIESEL,
             "status": CarStatus.AVAILABLE, "images": [
                "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80"]},
            # Add other cars...
        ]

        for data in cars_data:
            car = Car(**data)
            db.add(car)

        db.commit()
        return {"message": "Database seeded successfully!"}

    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()