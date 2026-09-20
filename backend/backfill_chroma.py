import os
import sys

# Ensure backend folder is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.activity import Activity
from app.models.expense import Expense
from app.models.harvest import Harvest
from app.models.crop import Crop
from app.routes.records import _embed_activity, _embed_expense, _embed_harvest, _embed_crop

def backfill():
    db: Session = SessionLocal()
    
    crops = db.query(Crop).all()
    for c in crops:
        _embed_crop(c, db)
        print(f"Embedded crop {c.id}")
        
    activities = db.query(Activity).all()
    for a in activities:
        _embed_activity(a, db)
        print(f"Embedded activity {a.id}")
        
    expenses = db.query(Expense).all()
    for e in expenses:
        _embed_expense(e, db)
        print(f"Embedded expense {e.id}")
        
    harvests = db.query(Harvest).all()
    for h in harvests:
        _embed_harvest(h, db)
        print(f"Embedded harvest {h.id}")

    print("Backfill complete.")
    db.close()

if __name__ == "__main__":
    backfill()
