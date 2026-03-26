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
    return pantryservices.add_item(item)


# Get all items
@router.get("/")
def get_pantry():
    return pantryservices.get_sorted_pantry()


#clear pantry (optional but useful)
@router.delete("/clear")
def clear():
    return pantryservices.clear_pantry()