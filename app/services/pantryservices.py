from datetime import datetime
from typing import List
from app.models.pantry import Item

pantry_db: List[Item] = []


def add_item(item: Item):
    pantry_db.append(item)
    return {"message": "Item added"}


def get_items():
    return pantry_db



def get_sorted_pantry():
    print("sorted function called")
    today = datetime.now()
    # expiry_date = datetime.strptime(item["expiry"], "%d/%m/%Y")

    def get_status(item):
        expiry_date = datetime.strptime(item.expiry, "%d/%m/%Y")
        if item.expiry is None:
            return "unknown"

        days_left = (expiry_date - today).days

        if days_left <= 2:
            return "expiring"
        elif days_left <= 7:
            return "soon"
        else:
            return "fresh"


# # class Item(BaseModel):
#     name:str
#     qty:int|None
#     expiry:str
#     category:str
#     # attach status


    enriched = []
    for item in pantry_db:
        status = get_status(item)
        enriched.append({
            "name": item.name,
            "qty": item.qty,
            "category": item.category,
            "expiry": item.expiry,
            "status": status
        })

   
    priority = {"expiring": 0, "soon": 1, "fresh": 2, "unknown": 3}

    enriched.sort(key=lambda x: priority[x["status"]])

    return enriched

def clear_pantry():
    pantry_db.clear()
    return {"message":"Pantry Cleared"}

from app.models.pantry import Item

def add_item_obj(item_dict):
    item = Item(**item_dict)
    pantry_db.append(item)