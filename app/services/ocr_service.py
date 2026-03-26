"""
OCR service for extracting text from receipt images.
Uses EasyOCR for accurate text recognition.
"""
from __future__ import annotations

import json
from typing import Any, Optional

import easyocr

from app.services import ollama_service

# Initialize OCR reader (cached)
_ocr_reader: Optional[easyocr.Reader] = None


def _get_ocr_reader() -> easyocr.Reader:
    global _ocr_reader
    if _ocr_reader is None:
        _ocr_reader = easyocr.Reader(['en'], gpu=False)
    return _ocr_reader


def extract_receipt_text(image_bytes: bytes) -> str:
    """
    Extract text from receipt image using OCR.
    Returns the raw text extracted from the image.
    """
    # Run OCR directly on bytes
    reader = _get_ocr_reader()
    results = reader.readtext(image_bytes)
    
    # Combine all detected text
    text_lines = [text for (bbox, text, confidence) in results if confidence > 0.3]
    extracted_text = "\n".join(text_lines)
    
    return extracted_text


def parse_receipt_items(ocr_text: str, image_bytes: Optional[bytes] = None) -> list[dict[str, Any]]:
    """
    Parse extracted receipt text to extract grocery items.
    Uses Ollama to intelligently extract items from raw OCR text.
    Falls back to vision model if OCR text is too short/unreliable.
    """
    
    # If OCR text is too short or empty, fall back to vision model
    if not ocr_text or len(ocr_text.strip()) < 20:
        if image_bytes:
            return _vision_fallback(image_bytes)
        raise ValueError("No OCR text extracted and no image for fallback")
    
    # Use Ollama to parse the OCR text into structured items
    prompt = f"""You are parsing receipt OCR text to extract grocery items.

RAW OCR TEXT FROM RECEIPT:
{ocr_text}

TASK: Extract only the food/grocery items from this receipt text.

OUTPUT: Return ONLY a valid JSON array with no other text:
[
  {{"name": "item name", "qty": 1}},
  {{"name": "another item", "qty": 2}}
]

RULES:
- Extract every food/grocery item visible in the text
- Use the exact product names from the receipt (not generic names)
- "qty" is the quantity number; if not clear, use 1
- Ignore: prices, totals, taxes, dates, store info, delivery fees, non-food items
- Return ONLY the JSON array, nothing else"""

    try:
        items = ollama_service.generate_text_array(prompt)
        return items
    except Exception as e:
        # If LLM parsing fails, try vision fallback
        if image_bytes:
            return _vision_fallback(image_bytes)
        raise ValueError(f"Failed to parse OCR text and no image for fallback: {e}") from e


def _vision_fallback(image_bytes: bytes) -> list[dict[str, Any]]:
    """
    Fallback to vision model if OCR fails.
    """
    prompt = """You are analyzing a grocery store receipt image.

TASK: Extract ONLY the food/grocery items sold (not prices, totals, dates, store info, or non-food items).

OUTPUT FORMAT - Return ONLY a valid JSON array:
[
  {"name": "item name", "qty": 1},
  {"name": "another item", "qty": 2}
]

RULES:
- "name": Must be the actual product name from the receipt
- "qty": The quantity number. If not specified, use 1.
- Include EVERY food item you can read
- Return ONLY the JSON array. No text before or after."""

    return ollama_service.generate_vision_items(
        image_bytes=image_bytes,
        prompt=prompt,
    )
