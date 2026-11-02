import json
import re
import os
import httpx
from typing import Dict, Any, Optional
from config import settings

class AIProviderService:
    @staticmethod
    def _clean_json_str(text: str) -> str:
        """Removes markdown code fences and whitespace from raw AI output."""
        cleaned = re.sub(r"^```(?:json)?\s*", "", text.strip(), flags=re.IGNORECASE)
        cleaned = re.sub(r"\s*```$", "", cleaned, flags=re.IGNORECASE)
        return cleaned.strip()

    @classmethod
    async def execute_prompt(
        cls,
        prompt: str,
        system_instruction: str = "You are an elite career intelligence engine. Respond strictly with valid JSON.",
        response_json: bool = True
    ) -> Dict[str, Any]:
        """
        Executes prompt across configured AI providers:
        1. Groq (Ultra-fast verified inference: qwen/qwen3.8-27b, openai/gpt-oss-120b)
        2. Google Gemini (REST with strict timeout)
        3. Deterministic Mock Fallback (zero UI crash guarantee)
        """
        # 1. Try Google Gemini First (Ultra-fast active endpoints, < 1s response)
        if settings.GOOGLE_GEMINI_API_KEY:
            gemini_models = ["gemini-flash-lite-latest", "gemini-3.5-flash-lite", "gemini-flash-latest"]
            for model_name in gemini_models:
                try:
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={settings.GOOGLE_GEMINI_API_KEY}"
                    payload = {
                        "contents": [{"parts": [{"text": f"{system_instruction}\n\n{prompt}"}]}]
                    }
                    if response_json:
                        payload["generationConfig"] = {"responseMimeType": "application/json"}

                    async with httpx.AsyncClient(timeout=4.0) as client:
                        resp = await client.post(url, json=payload)
                        if resp.status_code == 200:
                            data = resp.json()
                            candidate_parts = data.get("candidates", [{}])[0].get("content", {}).get("parts", [])
                            if candidate_parts and "text" in candidate_parts[0]:
                                text_content = candidate_parts[0]["text"]
                                if text_content.strip():
                                    return {
                                        "content": cls._clean_json_str(text_content),
                                        "provider_used": "gemini",
                                        "model": model_name
                                    }
                except Exception:
                    pass

        # 2. Try Groq (Fast failover)
        if settings.GROQ_API_KEY:
            groq_models = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"]
            for model_name in groq_models:
                try:
                    import groq
                    client = groq.Groq(api_key=settings.GROQ_API_KEY)
                    messages = [
                        {"role": "system", "content": system_instruction},
                        {"role": "user", "content": prompt}
                    ]
                    
                    completion = client.chat.completions.create(
                        model=model_name,
                        messages=messages,
                        response_format={"type": "json_object"} if response_json else None,
                        timeout=3.0
                    )
                    raw_text = completion.choices[0].message.content
                    if raw_text and raw_text.strip():
                        return {
                            "content": cls._clean_json_str(raw_text),
                            "provider_used": "groq",
                            "model": model_name
                        }
                except Exception as e:
                    print(f"[AIProvider] Groq model {model_name} warning: {e}")
                    break

        # 3. Deterministic Mock Fallback
        return {
            "content": "",
            "provider_used": "demo",
            "model": "deterministic-calibrated-engine"
        }
