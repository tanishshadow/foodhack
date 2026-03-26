from app.models.healthprofile import HealthProfile

# TEMP STORAGE (for hackathon)
user_profile: HealthProfile | None = None


def save_profile(profile: HealthProfile):
    global user_profile
    user_profile = profile
    return {"message": "Profile saved successfully"}


def get_profile():
    return user_profile


def build_profile_context():
    """
    This is what will be used in meal generation later
    """
    if not user_profile:
        return "No health profile provided."

    return f"""
    User Profile:
    Age: {user_profile.age}
    Gender: {user_profile.gender}
    Goal: {user_profile.goal}
    Activity Level: {user_profile.activity_level}
    Diet: {user_profile.diet_type}

    Allergies: {', '.join(user_profile.allergies)}
    Intolerances: {', '.join(user_profile.intolerances)}
    Conditions: {', '.join(user_profile.conditions)}

    Preferred cuisines: {', '.join(user_profile.cuisine_preferences)}
    Avoid: {user_profile.disliked_ingredients}
    """