from typing import List,Dict


from app.services import pantryservices

import json
from google import genai
import os
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# model = genai.GenerativeModel("gemini-1.5-flash")
def call_ai(prompt: str):
    response = client.models.generate_content(
    model="gemini-3-flash-preview",contents=prompt
)
    text =response.text
    text = text.replace("```json", "").replace("```", "")

    return text
        
        
def generate_meal_plan():
    pantry = pantryservices.get_sorted_pantry()

    expiring = [i["name"] for i in pantry if i["status"] == "expiring 🔴"]
    all_items = [i["name"] for i in pantry]

    prompt = f"""
    You are a meal planner for Indian households.

    Pantry items: {", ".join(all_items)}
    Expiring items: {", ".join(expiring)}

    Rules:
    - Prioritize expiring items first
    - Use Indian meals
    - Keep it simple

    Return JSON only.
    """

    # 🔥 call AI here
    response = call_ai(prompt)
    return json.loads(response) 

    # return response

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