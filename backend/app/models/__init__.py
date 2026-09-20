# models/__init__.py — import all models so Alembic can discover them
from app.models.user import User
from app.models.farm_record import FarmRecord

__all__ = ["User", "FarmRecord"]
