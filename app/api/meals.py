from fastapi import APIRouter
from app.services import mealservices, pantryservices

router = APIRouter(
    prefix="/meal",
    tags=["Meal"]
)

@router.get("/generate")
def generate_meal():
    pantry = pantryservices.get_sorted_pantry()

    result = mealservices.generate_meal_plan()

    return result