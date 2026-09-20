import sys
import os
import argparse

# Ensure backend folder is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.farm_record import FarmRecord
from app.services.vector_service import embed_and_store
from app.config import settings

def backfill(dry_run: bool = False, limit: int = None):
    print("Connecting to database...")
    db: Session = SessionLocal()
    
    try:
        query = db.query(FarmRecord)
        total = query.count()
        print(f"Found {total} farm records in PostgreSQL.")
        
        if limit:
            records = query.limit(limit).all()
            print(f"Limiting backfill to {limit} records.")
        else:
            records = query.all()
        
        if dry_run:
            print("--- DRY RUN MODE: No vectors will be upserted ---")
            print(f"Configured Pinecone Index: {settings.PINECONE_INDEX_NAME}")
            print(f"Configured Model: {settings.PINECONE_EMBEDDING_MODEL}")
            print(f"Configured Dimension: {settings.PINECONE_EMBEDDING_DIMENSION}")
        
        success_count = 0
        error_count = 0
        
        for i, r in enumerate(records, 1):
            try:
                # Reconstruct text representation identical to records.py
                details = {}
                if r.record_type == "activity":
                    details = {
                        "activity_type": r.activity_type, 
                        "description": r.description, 
                        "quantity": r.quantity, 
                        "unit": r.unit, 
                        "cost": r.cost
                    }
                elif r.record_type == "expense":
                    details = {
                        "expense_type": r.expense_type, 
                        "amount": r.amount, 
                        "description": r.description
                    }
                elif r.record_type == "harvest":
                    details = {
                        "harvest_quantity": r.harvest_quantity, 
                        "harvest_unit": r.harvest_unit, 
                        "quality_notes": r.quality_notes, 
                        "selling_price": r.selling_price, 
                        "total_revenue": r.total_revenue
                    }
                    
                non_null_details = ", ".join([f"{k}: {v}" for k, v in details.items() if v is not None])
                text_to_embed = f"Field: {r.field_name}, Crop: {r.crop_name}, Season: {r.season}, Date: {r.date}, Type: {r.record_type}, Details: {non_null_details}"
                
                if dry_run:
                    # Just verify requirements
                    user_id = str(r.user_id)
                    record_id = str(r.id)
                    if not user_id or user_id == "None":
                        raise ValueError("Missing user_id")
                    if i <= 2: # Print sample for visual verification
                        print(f"  [Dry Run Sample] ID: {record_id} | User: {user_id} | Text: {text_to_embed[:60]}...")
                    success_count += 1
                else:
                    embed_and_store(
                        record_id=str(r.id), 
                        table="farm_records", 
                        record_or_text=text_to_embed, 
                        user_id=str(r.user_id)
                    )
                    success_count += 1
                    
                if i % 10 == 0 or i == len(records):
                    print(f"Processed {i}/{len(records)} records...")
            except Exception as e:
                print(f"Error processing record {r.id}: {e}")
                error_count += 1
                
        print("\nBackfill complete.")
        print(f"Successfully processed: {success_count}")
        print(f"Errors: {error_count}")
        if dry_run:
            print("--- DRY RUN COMPLETED SAFELY ---")
        
    finally:
        db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Pinecone Backfill Script")
    parser.add_argument("--dry-run", action="store_true", help="Run without upserting vectors")
    parser.add_argument("--limit", type=int, default=None, help="Limit number of records")
    args = parser.parse_args()
    
    backfill(dry_run=args.dry_run, limit=args.limit)
