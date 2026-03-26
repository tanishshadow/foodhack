from google import genai
import os
from dotenv import load_dotenv
import json

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


def get_nutrition(meal_name: str):
    try:
        prompt = f"""
        Give nutritional information for the meal: {meal_name}

        Return ONLY JSON in this format:
        {{
          "calories": 400,
          "protein": 20,
          "carbs": 50,
          "fat": 10
        }}
        """

        response = client.models.generate_content(
            model="gemini-3-flash-preview",
            contents=prompt
        )

        text = response.text
        text = text.replace("```json", "").replace("```", "")

        data = json.loads(text)
        return data

    except Exception as e:
        print("NUTRITION ERROR:", e)

        # FALLBACK 
        return {
            "calories": 350,
            "protein": 15,
            "carbs": 45,
            "fat": 10
        }