from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database import engine, Base
from app.routers import car_router, booking_router, chatbot_router, auth_router, user_router
import logging
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    logger.info("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully!")
except Exception as e:
    logger.error(f"Error creating tables: {e}")
    raise

app = FastAPI(title="PH Car Rental API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://ph-car-rental.pages.dev",
        "*" # Kept for testing flexibility
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Keep this for backward compatibility with any old local uploads
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