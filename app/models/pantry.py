
from pydantic import BaseModel
from typing import Optional



class Item(BaseModel):
    name:str
    qty:int|None
    expiry:str
    category:str
    

