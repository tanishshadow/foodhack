from __future__ import annotations

import os
from typing import Any

from fastapi import HTTPException

from app.services import ollama_service


def get_nutrition(meal_name: str) -> dict[str, Any]:
    """
    Local nutrition estimate (no token quota) using Ollama.
    Expected JSON schema:
      { "calories": int, "protein": int, "carbs": int, "fat": int }
    """
    prompt = f"""
Give nutritional information for the meal: {meal_name}

Return ONLY a valid JSON object in exactly this format (no markdown, no commentary):
{{
  "calories": 400,
  "protein": 20,
  "carbs": 50,
  "fat": 10
}}
""".strip()

    try:
        model = os.getenv("OLLAMA_TEXT_MODEL")
        return ollama_service.generate_text_json(prompt, model=model)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Ollama nutrition generation failed: {e}")