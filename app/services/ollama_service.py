from __future__ import annotations

import base64
import json
import os
import re
import urllib.error
import urllib.request
from typing import Any, Optional

import dotenv


dotenv.load_dotenv()

DEFAULT_OLLAMA_HOST = "http://localhost:11434"
DEFAULT_OLLAMA_VISION_MODEL = "llava"
DEFAULT_OLLAMA_TEXT_MODEL = "llama3"


class OllamaServiceError(RuntimeError):
    pass


def _env(name: str, default: str) -> str:
    val = os.getenv(name)
    return val if val else default


def _ollama_url() -> str:
    return _env("OLLAMA_HOST", DEFAULT_OLLAMA_HOST).rstrip("/")


def _extract_first_json_object(text: str) -> dict[str, Any]:
    cleaned = (text or "").strip()
    cleaned = cleaned.replace("```json", "").replace("```", "").strip()

    # Direct parse attempt
    try:
        obj = json.loads(cleaned)
        if isinstance(obj, dict):
            return obj
    except Exception:
        pass

    # Extract first { ... } block
    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start != -1 and end != -1 and end > start:
        candidate = cleaned[start : end + 1].strip()
        parsed = json.loads(candidate)
        if isinstance(parsed, dict):
            return parsed

    raise ValueError("Could not locate a JSON object in Ollama output")


def _extract_first_json_array(text: str) -> list[Any]:
    cleaned = (text or "").strip()
    
    # Aggressive markdown cleanup
    cleaned = re.sub(r"```(?:json)?\s*", "", cleaned)
    cleaned = cleaned.replace("```", "").strip()
    
    # Remove any leading/trailing text before array (e.g., "Here's the array:")
    # First try direct parse on the full cleaned text
    try:
        arr = json.loads(cleaned)
        if isinstance(arr, list):
            return arr
    except Exception:
        pass

    # Extract first [ ... ] block, handling nested brackets
    start = cleaned.find("[")
    if start != -1:
        bracket_count = 0
        end = -1
        for i in range(start, len(cleaned)):
            if cleaned[i] == "[":
                bracket_count += 1
            elif cleaned[i] == "]":
                bracket_count -= 1
                if bracket_count == 0:
                    end = i
                    break
        
        if end != -1:
            candidate = cleaned[start : end + 1].strip()
            try:
                parsed = json.loads(candidate)
                if isinstance(parsed, list):
                    return parsed
            except Exception:
                pass

    # Last resort: greedy regex to find an array (non-greedy first)
    match = re.search(r"\[[\s\S]*?\]", cleaned)
    if match:
        candidate = match.group(0)
        try:
            parsed = json.loads(candidate)
            if isinstance(parsed, list):
                return parsed
        except Exception:
            pass

    # If still not found, try greedy regex
    match = re.search(r"\[[\s\S]*\]", cleaned)
    if match:
        candidate = match.group(0)
        try:
            parsed = json.loads(candidate)
            if isinstance(parsed, list):
                return parsed
        except Exception:
            pass

    # Better error message with context
    preview = cleaned[:200] if len(cleaned) > 200 else cleaned
    raise ValueError(f"Could not locate a JSON array in Ollama output. Got: {preview}")


def _post_ollama(payload: dict[str, Any]) -> dict[str, Any]:
    url = f"{_ollama_url()}/api/generate"
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=180) as resp:
            body = resp.read().decode("utf-8", errors="replace")
    except urllib.error.URLError as e:
        raise OllamaServiceError(
            f"Failed to reach Ollama at {_ollama_url()}. Is Ollama running and accessible? ({e})"
        ) from e
    except Exception as e:
        raise OllamaServiceError(f"Ollama request failed: {e}") from e

    try:
        return json.loads(body)
    except Exception as e:
        raise OllamaServiceError(f"Ollama returned non-JSON response: {body[:200]}") from e


def generate_text_json(
    prompt: str,
    *,
    model: Optional[str] = None,
    json_schema: Optional[dict[str, Any]] = None,
) -> dict[str, Any]:
    """
    Calls Ollama to generate a JSON object. Uses Ollama's `format` hint when provided.
    """
    used_model = model or _env("OLLAMA_TEXT_MODEL", DEFAULT_OLLAMA_TEXT_MODEL)
    payload: dict[str, Any] = {
        "model": used_model,
        "prompt": prompt,
        "stream": False,
    }
    if json_schema is not None:
        payload["format"] = json_schema
    else:
        # Hint: ask for JSON; we'll still parse defensively in case the model ignores it.
        payload["format"] = "json"

    res = _post_ollama(payload)
    response_text = res.get("response") or ""
    return _extract_first_json_object(response_text)


def generate_text_array(
    prompt: str,
    *,
    model: Optional[str] = None,
    json_schema: Optional[dict[str, Any]] = None,
) -> list[Any]:
    """
    Calls Ollama to generate a JSON array (used for receipt -> items).
    """
    used_model = model or _env("OLLAMA_TEXT_MODEL", DEFAULT_OLLAMA_TEXT_MODEL)
    payload: dict[str, Any] = {
        "model": used_model,
        "prompt": prompt,
        "stream": False,
    }
    if json_schema is not None:
        payload["format"] = json_schema
    else:
        payload["format"] = "json"

    res = _post_ollama(payload)
    response_text = res.get("response") or ""
    return _extract_first_json_array(response_text)


def generate_vision_items(
    *,
    image_bytes: bytes,
    prompt: str,
    model: Optional[str] = None,
) -> list[dict[str, Any]]:
    """
    Uses a vision-capable Ollama model to extract grocery items from an image.
    """
    used_model = model or _env("OLLAMA_VISION_MODEL", DEFAULT_OLLAMA_VISION_MODEL)
    img_b64 = base64.b64encode(image_bytes).decode("utf-8")

    payload: dict[str, Any] = {
        "model": used_model,
        "prompt": prompt,
        "stream": False,
        "images": [img_b64],
        # Ask for JSON; parsing is still defensive.
        "format": "json",
    }

    res = _post_ollama(payload)
    response_text = res.get("response") or ""
    arr = _extract_first_json_array(response_text)
    # Best-effort typing: ensure each element is an object.
    if not isinstance(arr, list):
        raise ValueError("Expected a JSON array from vision extraction")
    return arr  # type: ignore[return-value]

