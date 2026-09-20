"""
seed_data.py
────────────
Seeds the database with the demo data for the Unified Farm Record Platform:
  - Demo Farmer user
  - Unified farm_records
  - All records also embedded into Pinecone

Usage:
  cd backend
  python seed_data.py
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from datetime import date
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.database import engine, Base, SessionLocal
import app.models  # noqa — registers all models

from app.models.user import User
from app.models.farm_record import FarmRecord
from app.services.vector_service import embed_and_store

pwd_context = CryptContext(schemes=["sha256_crypt"], deprecated="auto")


def seed():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()

    try:
        if db.query(User).filter(User.email == "demo@kisanvault.com").first():
            print("Demo user already exists. Skipping seed.")
            return

        user = User(
            name="Demo Farmer",
            email="demo@kisanvault.com",
            password_hash=pwd_context.hash("demo1234"),
        )
        db.add(user)
        db.flush()
        print(f"Created user: {user.email}")

        records = [
            FarmRecord(user_id=user.id, field_name="North Field", crop_name="Wheat", season="Rabi 2024", date=date(2024, 10, 1), record_type="activity", activity_type="field_preparation", description="Ploughed and levelled the field", cost=1200.0),
            FarmRecord(user_id=user.id, field_name="North Field", crop_name="Wheat", season="Rabi 2024", date=date(2024, 10, 15), record_type="activity", activity_type="irrigation", description="First irrigation after sowing", quantity=500.0, unit="litres", cost=200.0),
            FarmRecord(user_id=user.id, field_name="North Field", crop_name="Wheat", season="Rabi 2024", date=date(2024, 10, 20), record_type="activity", activity_type="fertilizer", description="DAP fertilizer application", quantity=10.0, unit="kg", cost=500.0),
            FarmRecord(user_id=user.id, field_name="North Field", crop_name="Wheat", season="Rabi 2024", date=date(2024, 11, 5), record_type="activity", activity_type="pesticide", description="Aphid control spray", quantity=2.0, unit="litres", cost=300.0),
            FarmRecord(user_id=user.id, field_name="South Field", crop_name="Rice", season="Kharif 2024", date=date(2024, 6, 10), record_type="activity", activity_type="irrigation", description="Flood irrigation for paddy", quantity=800.0, unit="litres", cost=150.0),
            FarmRecord(user_id=user.id, field_name="South Field", crop_name="Rice", season="Kharif 2024", date=date(2024, 6, 20), record_type="activity", activity_type="fertilizer", description="Urea top dressing", quantity=15.0, unit="kg", cost=750.0),
            
            FarmRecord(user_id=user.id, field_name="North Field", crop_name="Wheat", season="Rabi 2024", date=date(2024, 9, 28), record_type="expense", expense_type="Seeds", amount=800.0, description="Wheat seeds purchase"),
            FarmRecord(user_id=user.id, field_name="North Field", crop_name="Wheat", season="Rabi 2024", date=date(2025, 1, 14), record_type="expense", expense_type="Labour", amount=2000.0, description="Harvesting labour"),
            FarmRecord(user_id=user.id, field_name="South Field", crop_name="Rice", season="Kharif 2024", date=date(2024, 5, 28), record_type="expense", expense_type="Seeds", amount=600.0, description="Rice seeds"),
            FarmRecord(user_id=user.id, field_name="South Field", crop_name="Rice", season="Kharif 2024", date=date(2024, 6, 5), record_type="expense", expense_type="Labour", amount=1500.0, description="Transplanting labour"),
            
            FarmRecord(user_id=user.id, field_name="North Field", crop_name="Wheat", season="Rabi 2024", date=date(2025, 1, 15), record_type="harvest", harvest_quantity=800.0, harvest_unit="kg", quality_notes="Good quality, minimal pest damage", selling_price=30.0, total_revenue=24000.0),
            FarmRecord(user_id=user.id, field_name="South Field", crop_name="Rice", season="Kharif 2024", date=date(2024, 9, 20), record_type="harvest", harvest_quantity=600.0, harvest_unit="kg", quality_notes="Good quality rice", selling_price=30.0, total_revenue=18000.0),
        ]
        
        db.add_all(records)
        db.commit()
        print(f"Created {len(records)} farm records")

        print("\nEmbedding records into Pinecone...")
        for r in records:
            # Reconstruct text like in records.py
            details = {}
            if r.record_type == "activity":
                details = {"activity_type": r.activity_type, "description": r.description, "quantity": r.quantity, "unit": r.unit, "cost": r.cost}
            elif r.record_type == "expense":
                details = {"expense_type": r.expense_type, "amount": r.amount, "description": r.description}
            elif r.record_type == "harvest":
                details = {"harvest_quantity": r.harvest_quantity, "harvest_unit": r.harvest_unit, "quality_notes": r.quality_notes, "selling_price": r.selling_price, "total_revenue": r.total_revenue}
                
            non_null_details = ", ".join([f"{k}: {v}" for k, v in details.items() if v is not None])
            text_to_embed = f"Field: {r.field_name}, Crop: {r.crop_name}, Season: {r.season}, Date: {r.date}, Type: {r.record_type}, Details: {non_null_details}"
            
            embed_and_store(str(r.id), "farm_records", text_to_embed, str(user.id))

        print("\nSeed data loaded successfully!")
        print("   Demo login: demo@kisanvault.com / demo1234")

    except Exception as e:
        db.rollback()
        print(f"\nERROR seeding data: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
