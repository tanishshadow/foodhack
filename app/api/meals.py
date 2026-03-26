from fastapi import APIRouter, HTTPException
from app.services import healthprofileservices, mealservices, pantryservices

router = APIRouter(
    prefix="/meal",
    tags=["Meal"]
)

@router.get("/generate")
def generate_meal():
    try:
        pantry = pantryservices.get_sorted_pantry()
        profile_context = healthprofileservices.build_profile_context()
        result = mealservices.generate_meal_plan(profile_context=profile_context)
        return result

    except Exception as e:
        print("ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))