from app.services import pantryservices
from app.services import pantryservices
from google import genai
import os
from google.genai import types
from dotenv import load_dotenv
import json

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


async def process_invoice(file):
    image_bytes = await file.read()

    prompt = """
    Extract grocery items from this receipt.

    Return ONLY JSON in this format:
    [
      {"name": "milk", "qty": 2},
      {"name": "rice", "qty": 1}
    ]

    Ignore prices, totals, and non-food items.
    """

    response = client.models.generate_content(
        model="gemini-3-flash-preview",
        contents=[
    prompt,
    types.Part.from_bytes(
        data=image_bytes,
        mime_type="image/png"
    )
]
    )

    text = response.text
    text = text.replace("```json", "").replace("```", "")
    
    
    try:
        items = json.loads(text)
    except:
        return {"error": "Failed to parse invoice"}
    
    added_items = []

    for item in items:
        enriched = {
            "name": item.get("name"),
            "qty": item.get("qty", 1),
            "category": "general",   # improve later
            "expiry": "30/03/2026"   # dummy for now
        }

        pantryservices.add_item_obj(enriched)
        added_items.append(enriched)
        
    return {
        "message": "Invoice processed",
        "items_added": added_items
    }