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
    """Add missing columns to bookings table on startup"""
    from sqlalchemy import text

    logger.info("Checking for missing columns in bookings table...")
    try:
        with engine.connect() as conn:
            # Add total_price if not exists
            try:
                conn.execute(text("""
                    ALTER TABLE bookings 
                    ADD COLUMN IF NOT EXISTS total_price FLOAT
                """))
                conn.commit()
                logger.info("✓ Ensured total_price column exists")
            except Exception as e:
                logger.warning(f"total_price check: {e}")

            # Add created_at if not exists
            try:
                conn.execute(text("""
                    ALTER TABLE bookings 
                    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                """))
                conn.commit()
                logger.info("✓ Ensured created_at column exists")
            except Exception as e:
                logger.warning(f"created_at check: {e}")

        logger.info("Database migration completed!")
    except Exception as e:
        logger.error(f"Migration error: {e}")