from pydantic import BaseModel
from typing import List

class ExtractedItem(BaseModel):
    name: str
    qty: int

class InvoiceResponse(BaseModel):
    items: List[ExtractedItem]