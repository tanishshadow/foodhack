from __future__ import annotations

import os
from fastapi import HTTPException

from app.services import ollama_service, pantryservices


async def process_invoice(file):
    """
    Receipt -> pantry items using local Ollama (no tokens/quota).
    Expected Ollama output: JSON array of objects: [{ "name": str, "qty": int }...]
    """
    image_bytes = await file.read()

    prompt = """
Extract grocery items from this receipt image.
Return ONLY a JSON array in this exact format:
[
  {"name":"string","qty":1}
]
Rules:
- Include ONLY food/grocery items (ignore prices, totals, non-food items, discounts).
- If quantity is not present, use qty=1.
- "name" must be a short grocery name (e.g., "milk", "rice", "eggs").
- Return ONLY the JSON array. No markdown, no commentary.
""".strip()

    try:
        items = ollama_service.generate_vision_items(
            image_bytes=image_bytes,
            prompt=prompt,
            model=os.getenv("OLLAMA_VISION_MODEL"),
        )
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Ollama invoice extraction failed: {e}")

    if not isinstance(items, list):
        raise HTTPException(status_code=422, detail="Ollama invoice extraction did not return a JSON array")

    added_items = []
    for item in items:
        if not isinstance(item, dict):
            continue

        name = str(item.get("name", "")).strip()
        if not name:
            continue

        qty_raw = item.get("qty", 1)
        try:
            qty = int(qty_raw)
        except Exception:
            qty = 1

        enriched = {
            "name": name,
            "qty": qty,
            "category": "general",
            "expiry": "30/03/2026",
        }
        pantryservices.add_item_obj(enriched)
        added_items.append(enriched)

    return {"message": "Invoice processed", "items_added": added_items}