# app/api/pantry.py

from fastapi import APIRouter
from typing import List
from app.models.pantry import Item
from app.services import pantryservices

router = APIRouter(
    prefix="/pantry",
    tags=["Pantry"]
)

# Add item
@router.post("/add")
def add_item(item: Item):
    return pantry_service.add_item(item)


# Get all items
@router.get("/", response_model=List[Item])
def get_pantry():
    return pantry_service.get_items()


#clear pantry (optional but useful)
@router.delete("/clear")
def clear():
    return pantry_service.clear_pantry()