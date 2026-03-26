"""
Implementation of OCR-based receipt/invoice processing.
"""
from __future__ import annotations

from typing import Any

from app.services import ocr_service


def process_receipt_with_ocr(image_bytes: bytes) -> list[dict[str, Any]]:
    """
    Process receipt image using OCR + LLM parsing.
    
    Steps:
    1. Extract text from image using OCR
    2. Parse text with Ollama to extract structured items
    3. Fall back to vision model if needed
    
    Returns: List of items with "name" and "qty" fields
    """
    # Try OCR first
    try:
        ocr_text = ocr_service.extract_receipt_text(image_bytes)
        items = ocr_service.parse_receipt_items(ocr_text, image_bytes=image_bytes)
        return items
    except Exception as e:
        # If OCR completely fails, fall back to vision model
        raise ValueError(f"Receipt processing failed: {e}") from e
