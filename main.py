from pydantic import BaseModel
from fastapi import FastAPI,HTTPException,APIRouter,UploadFile
from fastapi.middleware.cors import CORSMiddleware
from api import pantry,meals,healthprofile,barcode,price
import os
from dotenv import load_dotenv

origins = [
    "http://localhost.tiangolo.com",
    "https://localhost.tiangolo.com",
    "http://localhost",
    "http://localhost:8080",
]
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

router = APIRouter(prefix="/pantry",tags=["Pantry"])
app.include_router(pantry.router)


router = APIRouter(prefix="/meals",tags=["Meal"])
app.include_router(meals.router)

router = APIRouter(prefix="/pantry",tags=["Pantry"])
app.include_router(healthprofile.router)


router = APIRouter(prefix="/barcode",tags=["Barcode"])
app.include_router(barcode.router)

router = APIRouter(prefix="pricecompare",tags=["Price Compare"])
app.include_router(price.router)






# class Test(BaseModel):
#     pass


# @app.get("/")
# async def home():
#     return "HOME"


# @app.post("/")
# async def test():
#     pass




