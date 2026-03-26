from __future__ import annotations

import os
from fastapi import HTTPException

from app.services import invoiceservices_impl, pantryservices


async def process_invoice(file):
    """
    Receipt -> pantry items using OCR + Ollama for intelligent parsing.
    First extracts text via OCR, then uses Ollama to parse items.
    Falls back to vision model if OCR is insufficient.
    """
    image_bytes = await file.read()

    try:
        items = invoiceservices_impl.process_receipt_with_ocr(image_bytes)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Invoice/receipt processing failed: {e}")

    if not isinstance(items, list):
        raise HTTPException(status_code=422, detail="Invoice processing did not return items")

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