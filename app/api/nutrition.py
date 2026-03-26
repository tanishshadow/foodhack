from fastapi import APIRouter
from app.services import nutritionalservices

router = APIRouter(
    prefix="/nutrition",
    tags=["Nutrition"]
)


@router.get("/{meal_name}")
def get_nutrition(meal_name: str):
    result = nutritionalservices.get_nutrition(meal_name)
    return result
