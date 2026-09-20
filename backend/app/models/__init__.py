# models/__init__.py — import all models so Alembic can discover them
from app.models.user import User
from app.models.field import Field
from app.models.crop import Crop
from app.models.activity import Activity
from app.models.expense import Expense
from app.models.harvest import Harvest

__all__ = ["User", "Field", "Crop", "Activity", "Expense", "Harvest"]
