from fastapi import APIRouter, UploadFile, File
from app.services import invoiceservices

router = APIRouter(
    prefix="/invoice",
    tags=["Invoice"]
)

@router.post("/upload")
async def upload_invoice(file: UploadFile = File(...)):
    return await invoiceservices.process_invoice(file)