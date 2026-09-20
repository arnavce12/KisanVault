"""
seed_data.py
────────────
Seeds the database with the demo data from plan.md:
  - Demo Farmer user
  - 2 fields: North Field, South Field
  - 2 crops: Wheat (Rabi 2024), Rice (Kharif 2024)
  - Activities, Expenses, Harvests
  - All records also embedded into ChromaDB

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
from app.models.field import Field
from app.models.crop import Crop
from app.models.activity import Activity
from app.models.expense import Expense
from app.models.harvest import Harvest
from app.services.vector_service import embed_and_store

# Use sha256_crypt to avoid passlib/bcrypt-5.x incompatibility on Python 3.12
pwd_context = CryptContext(schemes=["sha256_crypt"], deprecated="auto")


def seed():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()

    try:
        # ── Clear existing demo data ──────────────────────────────────────────
        if db.query(User).filter(User.email == "demo@kisanvault.com").first():
            print("Demo user already exists. Skipping seed.")
            return

        # ── User ─────────────────────────────────────────────────────────────
        user = User(
            name="Demo Farmer",
            email="demo@kisanvault.com",
            password_hash=pwd_context.hash("demo1234"),
        )
        db.add(user)
        db.flush()
        print(f"Created user: {user.email}")

        # ── Fields ────────────────────────────────────────────────────────────
        north_field = Field(
            user_id=user.id,
            field_name="North Field",
            location="North side of village",
            area_acres=5.0,
        )
        south_field = Field(
            user_id=user.id,
            field_name="South Field",
            location="South side of village",
            area_acres=3.0,
        )
        db.add_all([north_field, south_field])
        db.flush()
        print("Created: North Field, South Field")

        # ── Crops ─────────────────────────────────────────────────────────────
        wheat = Crop(
            field_id=north_field.id,
            crop_name="Wheat",
            season="Rabi 2024",
            sowing_date=date(2024, 10, 1),
            expected_harvest_date=date(2025, 1, 15),
            status="harvested",
        )
        rice = Crop(
            field_id=south_field.id,
            crop_name="Rice",
            season="Kharif 2024",
            sowing_date=date(2024, 6, 1),
            expected_harvest_date=date(2024, 9, 20),
            status="harvested",
        )
        db.add_all([wheat, rice])
        db.flush()
        print("Created: Wheat (Rabi 2024), Rice (Kharif 2024)")

        # ── Activities ────────────────────────────────────────────────────────
        activities = [
            Activity(crop_id=wheat.id, field_id=north_field.id,
                     activity_type="field_preparation",
                     description="Ploughed and levelled the field",
                     date=date(2024, 10, 1), cost=1200.0),
            Activity(crop_id=wheat.id, field_id=north_field.id,
                     activity_type="irrigation",
                     description="First irrigation after sowing",
                     quantity=500.0, unit="litres",
                     date=date(2024, 10, 15), cost=200.0),
            Activity(crop_id=wheat.id, field_id=north_field.id,
                     activity_type="fertilizer",
                     description="DAP fertilizer application",
                     quantity=10.0, unit="kg",
                     date=date(2024, 10, 20), cost=500.0),
            Activity(crop_id=wheat.id, field_id=north_field.id,
                     activity_type="pesticide",
                     description="Aphid control spray",
                     quantity=2.0, unit="litres",
                     date=date(2024, 11, 5), cost=300.0),
            Activity(crop_id=rice.id, field_id=south_field.id,
                     activity_type="irrigation",
                     description="Flood irrigation for paddy",
                     quantity=800.0, unit="litres",
                     date=date(2024, 6, 10), cost=150.0),
            Activity(crop_id=rice.id, field_id=south_field.id,
                     activity_type="fertilizer",
                     description="Urea top dressing",
                     quantity=15.0, unit="kg",
                     date=date(2024, 6, 20), cost=750.0),
        ]
        db.add_all(activities)
        db.flush()
        print(f"Created {len(activities)} activities")

        # ── Expenses ──────────────────────────────────────────────────────────
        expenses = [
            Expense(field_id=north_field.id, crop_id=wheat.id,
                    expense_type="Seeds",
                    amount=800.0, description="Wheat seeds purchase",
                    date=date(2024, 9, 28)),
            Expense(field_id=north_field.id, crop_id=wheat.id,
                    expense_type="Labour",
                    amount=2000.0, description="Harvesting labour",
                    date=date(2025, 1, 14)),
            Expense(field_id=south_field.id, crop_id=rice.id,
                    expense_type="Seeds",
                    amount=600.0, description="Rice seeds",
                    date=date(2024, 5, 28)),
            Expense(field_id=south_field.id, crop_id=rice.id,
                    expense_type="Labour",
                    amount=1500.0, description="Transplanting labour",
                    date=date(2024, 6, 5)),
        ]
        db.add_all(expenses)
        db.flush()
        print(f"Created {len(expenses)} expenses")

        # ── Harvests ──────────────────────────────────────────────────────────
        harvests = [
            Harvest(crop_id=wheat.id, field_id=north_field.id,
                    harvest_date=date(2025, 1, 15),
                    quantity=800.0, unit="kg",
                    quality_notes="Good quality, minimal pest damage",
                    selling_price=30.0, total_revenue=24000.0),
            Harvest(crop_id=rice.id, field_id=south_field.id,
                    harvest_date=date(2024, 9, 20),
                    quantity=600.0, unit="kg",
                    quality_notes="Good quality rice",
                    selling_price=30.0, total_revenue=18000.0),
        ]
        db.add_all(harvests)
        db.commit()
        print(f"Created {len(harvests)} harvests")

        # ── Embed all records into ChromaDB ───────────────────────────────────
        print("\nEmbedding records into ChromaDB...")
        for a in activities:
            field = north_field if a.field_id == north_field.id else south_field
            crop = wheat if a.crop_id == wheat.id else rice
            embed_and_store(str(a.id), "activities", {
                "field_name": field.field_name,
                "crop_name": crop.crop_name,
                "season": crop.season,
                "activity_type": a.activity_type,
                "description": a.description,
                "date": str(a.date),
                "quantity": a.quantity,
                "unit": a.unit,
                "cost": a.cost,
            })

        for e in expenses:
            field = north_field if e.field_id == north_field.id else south_field
            crop = wheat if e.crop_id == wheat.id else rice
            embed_and_store(str(e.id), "expenses", {
                "field_name": field.field_name,
                "crop_name": crop.crop_name,
                "season": crop.season,
                "expense_type": e.expense_type,
                "amount": e.amount,
                "description": e.description,
                "date": str(e.date),
            })

        for h in harvests:
            field = north_field if h.field_id == north_field.id else south_field
            crop = wheat if h.crop_id == wheat.id else rice
            embed_and_store(str(h.id), "harvests", {
                "field_name": field.field_name,
                "crop_name": crop.crop_name,
                "season": crop.season,
                "harvest_date": str(h.harvest_date),
                "quantity": h.quantity,
                "unit": h.unit,
                "selling_price": h.selling_price,
                "total_revenue": h.total_revenue,
                "quality_notes": h.quality_notes,
            })

        for c in [wheat, rice]:
            field = north_field if c.field_id == north_field.id else south_field
            embed_and_store(str(c.id), "crops", {
                "field_name": field.field_name,
                "crop_name": c.crop_name,
                "season": c.season,
                "sowing_date": str(c.sowing_date),
                "expected_harvest_date": str(c.expected_harvest_date),
                "status": c.status,
            })

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
