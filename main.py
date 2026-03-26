from pydantic import BaseModel
from fastapi import FastAPI,HTTPException,APIRouter,UploadFile
from fastapi.middleware.cors import CORSMiddleware
from app.api import pantry,meals,healthprofile,barcode,price,invoice,nutrition
import os
from dotenv import load_dotenv

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/")
def root():
    return {"message":"Working"}
# router = APIRouter(prefix="/pantry",tags=["Pantry"])
app.include_router(pantry.router)
app.include_router(meals.router)
app.include_router(invoice.router)
app.include_router(nutrition.router)


# router = APIRouter(prefix="/meals",tags=["Meal"])
# app.include_router(meals.router)

# router = APIRouter(prefix="/pantry",tags=["Pantry"])
# app.include_router(healthprofile.router)


# router = APIRouter(prefix="/barcode",tags=["Barcode"])
# app.include_router(barcode.router)

# router = APIRouter(prefix="pricecompare",tags=["Price Compare"])
# app.include_router(price.router)






# class Test(BaseModel):
#     pass


# @app.get("/")
# async def home():
#     return "HOME"


# @app.post("/")
# async def test():
#     pass




