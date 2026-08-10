import os
from sqlalchemy import create_engine, text, inspect
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("❌ ERROR: DATABASE_URL not found in .env file!")
    print("Please check your backend/.env file")
    exit(1)

print("🔌 Connecting to database...")

try:
    engine = create_engine(DATABASE_URL)

    # First, check what columns currently exist
    print("\n📋 Checking current 'bookings' table structure...")
    with engine.connect() as conn:
        inspector = inspect(engine)
        columns = [col['name'] for col in inspector.get_columns('bookings')]
        print(f"   Current columns: {', '.join(columns)}")

        # Check if columns already exist
        needs_total_price = 'total_price' not in columns
        needs_created_at = 'created_at' not in columns

        if not needs_total_price and not needs_created_at:
            print("\n✅ All required columns already exist!")
            exit(0)

        print("\n🔧 Adding missing columns...\n")

        # Add total_price if missing
        if needs_total_price:
            try:
                conn.execute(text("""
                    ALTER TABLE bookings 
                    ADD COLUMN total_price FLOAT
                """))
                conn.commit()
                print("✅ Added 'total_price' column")
            except Exception as e:
                print(f"❌ Error adding total_price: {e}")
                conn.rollback()

        # Add created_at if missing
        if needs_created_at:
            try:
                conn.execute(text("""
                    ALTER TABLE bookings 
                    ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                """))
                conn.commit()
                print("✅ Added 'created_at' column")
            except Exception as e:
                print(f" Error adding created_at: {e}")
                conn.rollback()

        # Verify the changes
        print("\n📋 Verifying changes...")
        columns = [col['name'] for col in inspector.get_columns('bookings')]
        print(f"   Updated columns: {', '.join(columns)}")

        if 'total_price' in columns and 'created_at' in columns:
            print("\n✅ Migration completed successfully!")
        else:
            print("\n⚠️  Some columns may still be missing. Please check the errors above.")

except Exception as e:
    print(f"\n❌ Failed: {e}")
    print("\nTroubleshooting:")
    print("1. Check if DATABASE_URL is correct in backend/.env")
    print("2. Make sure your database is accessible")
    exit(1)