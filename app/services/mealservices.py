from __future__ import annotations

import os
from typing import Any

from app.services import ollama_service, pantryservices


def generate_meal_plan(profile_context: str | None = None) -> dict[str, Any]:
    pantry = pantryservices.get_sorted_pantry()

    expiring_statuses = {"expiring", "expiring 🔴"}
    expiring = [i["name"] for i in pantry if i.get("status") in expiring_statuses]
    all_items = [i["name"] for i in pantry if i.get("name")]

    prompt = f"""
You are a meal planner for Indian households.

Pantry items: {", ".join(all_items)}
Expiring items: {", ".join(expiring)}

Health Profile:
{profile_context or "No health profile provided."}

Rules:
- Prioritize expiring items first (if any), otherwise use any pantry items.
- Use Indian meals.
- Keep it simple and realistic.
- Follow the health profile constraints (diet, allergies, intolerances, conditions, and disliked ingredients).
- Only use pantry items for "ingredients_used" (names must match pantry item names).

Return ONLY a valid JSON object in exactly this format (no markdown, no commentary):
{{
  "meal_plan": [
    {{
      "meal_name": "string",
      "description": "string",
      "ingredients_used": ["string", "string"]
    }},
    {{
      "meal_name": "string",
      "description": "string",
      "ingredients_used": ["string", "string"]
    }}
  ]
}}
"""

    model = os.getenv("OLLAMA_TEXT_MODEL")
    result = ollama_service.generate_text_json(prompt, model=model)

    # Lightweight validation to avoid frontend breakage.
    meal_plan = result.get("meal_plan")
    if not isinstance(meal_plan, list) or len(meal_plan) != 2:
        raise ValueError("Ollama meal generation did not return exactly 2 meals")

    return result

# def generate_meal_plan(pantry):
#     # 🔥 prioritize expiring items
#     expiring = [item for item in pantry if item["status"] == "expiring 🔴"]

#     if expiring:
#         return {
#             "monday": [f"use {expiring[0]['name']} dish"],
#             "tuesday": ["simple veg meal"],
#             "wednesday": ["rice + dal"]
#         }

#     return {
#         "monday": ["roti sabzi"],
#         "tuesday": ["dal rice"],
#         "wednesday": ["pulao"]
#     }