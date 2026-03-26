from fastapi import APIRouter
from app.services import mealservices, pantryservices

router = APIRouter(
    prefix="/meal",
    tags=["Meal"]
)

@router.get("/generate")
def generate_meal():
    try:
        pantry = pantryservices.get_sorted_pantry()
        result = mealservices.generate_meal_plan(pantry)
        return result

    except Exception as e:
        print("ERROR:", e)

        # 🔥 fallback for demo
        return {
            "meal_plan": [
                {
                    "meal_name": "Veg Fried Rice",
                    "description": "Quick meal using pantry items",
                    "ingredients_used": ["rice", "vegetables"]
                },
                {
                    "meal_name": "Omelette Toast",
                    "description": "Simple protein-rich breakfast",
                    "ingredients_used": ["egg", "bread"]
                }
            ]
        }