from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database import engine, Base
from app.routers import car_router, booking_router, chatbot_router, auth_router, user_router
import logging
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="PH Car Rental API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://ph-car-rental.pages.dev",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded images statically
uploads_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

app.include_router(auth_router.router)
app.include_router(car_router.router)
app.include_router(booking_router.router)
app.include_router(chatbot_router.router)
app.include_router(user_router.router)

@app.get("/")
def root():
    return {"message": "PH Car Rental API is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "database": "connected"}

@app.on_event("startup")
def create_tables():
    logger.info("Creating/updating database tables...")
    try:
        # This will create tables if they don't exist
        # Note: It won't add columns to existing tables automatically
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables checked/created successfully!")
    except Exception as e:
        logger.error(f"Error with database tables: {e}")


@app.on_event("startup")
async def add_missing_columns():
    """Add missing columns and fix payment_method on startup"""
    from sqlalchemy import text

    logger.info("Running database migrations...")
    try:
        with engine.connect() as conn:
            # 1. Add total_price if not exists
            try:
                conn.execute(text("""
                    ALTER TABLE bookings 
                    ADD COLUMN IF NOT EXISTS total_price FLOAT
                """))
                conn.commit()
                logger.info("✓ total_price column")
            except Exception as e:
                logger.warning(f"total_price: {e}")

            # 2. Add created_at if not exists
            try:
                conn.execute(text("""
                    ALTER TABLE bookings 
                    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                """))
                conn.commit()
                logger.info("✓ created_at column")
            except Exception as e:
                logger.warning(f"created_at: {e}")

            # 3. Fix payment_method - change from ENUM to VARCHAR
            try:
                conn.execute(text("""
                    ALTER TABLE bookings 
                    ALTER COLUMN payment_method TYPE VARCHAR
                """))
                conn.commit()
                logger.info("✓ payment_method changed to VARCHAR")
            except Exception as e:
                logger.warning(f"payment_method: {e}")

        logger.info("✅ Database migrations completed!")
    except Exception as e:
        logger.error(f"Migration error: {e}")