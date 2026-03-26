from pydantic import BaseModel
from typing import List

class HealthProfile(BaseModel):
    age: str
    gender: str

    weight: str
    weight_unit: str

    height: str
    height_unit: str

    goal: str
    activity_level: str

    diet_type: str

    allergies: List[str] = []
    intolerances: List[str] = []
    conditions: List[str] = []

    meals_per_day: str

    cuisine_preferences: List[str] = []
    disliked_ingredients: str = ""