from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database import engine, Base
from app.routers import car_router, booking_router, chatbot_router, auth_router, user_router
import logging
import os
from sqlalchemy import text

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="PH Car Rental API")

# CORS Configuration - Fixed
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Temporarily allow all for debugging
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
    try:
        # Test database connection
        from app.database import SessionLocal
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}


@app.on_event("startup")
async def startup_event():
    logger.info("=" * 50)
    logger.info("Starting up PH Car Rental API...")
    logger.info("=" * 50)

    # 1. Create all tables
    try:
        logger.info("Creating database tables...")
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Database tables created/updated successfully!")
    except Exception as e:
        logger.error(f"❌ Error creating tables: {e}")
        logger.error(f"Error type: {type(e)}")

    # 2. Run migrations
    logger.info("Running database migrations...")
    try:
        with engine.connect() as conn:
            # Add total_price
            try:
                conn.execute(text("""
                    ALTER TABLE bookings 
                    ADD COLUMN IF NOT EXISTS total_price FLOAT
                """))
                conn.commit()
                logger.info("✓ total_price column")
            except Exception as e:
                logger.warning(f"total_price: {e}")

            # Add created_at
            try:
                conn.execute(text("""
                    ALTER TABLE bookings 
                    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                """))
                conn.commit()
                logger.info("✓ created_at column")
            except Exception as e:
                logger.warning(f"created_at: {e}")

            # Fix payment_method
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
        logger.error(f"❌ Migration error: {e}")

    logger.info("=" * 50)
    logger.info("Startup complete!")
    logger.info("=" * 50)