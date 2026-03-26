from fastapi import APIRouter, HTTPException
from app.services import healthprofileservices, mealservices, pantryservices
from app.models.healthprofile import HealthProfile

router = APIRouter(
    prefix="/meal",
    tags=["Meal"]
)

@router.post("/generate")
def generate_meal(profile: HealthProfile = None):
    try:
        pantry = pantryservices.get_sorted_pantry()
        
        # If profile provided, save it for context
        if profile and (profile.age or profile.goal):
            healthprofileservices.save_profile(profile)
        
        # Build profile context (either from provided profile or stored one)
        profile_context = healthprofileservices.build_profile_context()
        result = mealservices.generate_meal_plan(profile_context=profile_context)
        return result

    except Exception as e:
        print("ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))