from fastapi import APIRouter
from app.models.healthprofile import HealthProfile
from app.services import healthprofileservices

router = APIRouter(
    prefix="/health-profile",
    tags=["Health Profile"]
)


@router.post("")
def save_health_profile(profile: HealthProfile):
    return healthprofileservices.save_profile(profile)


@router.get("")
def get_health_profile():
    return healthprofileservices.get_profile()