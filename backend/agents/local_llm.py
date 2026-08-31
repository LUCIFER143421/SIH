import json
import httpx
from typing import Optional, Dict, Any, List
from config import OLLAMA_BASE_URL, OLLAMA_MODEL, LLM_PROVIDER
from agents.prompts import COPILOT_SYSTEM_PROMPT

class LocalLLMService:
    def __init__(self):
        self.base_url = OLLAMA_BASE_URL
        self.model = OLLAMA_MODEL
        self.provider = LLM_PROVIDER

    async def generate_response(self, user_query: str, tool_context: str, conversation_history: Optional[List[Dict[str, str]]] = None) -> Optional[str]:
        """
        Attempts to call the local LLM (Ollama) with strict grounded context.
        Returns None if Ollama is offline or unavailable, signaling deterministic fallback.
        """
        if self.provider == "deterministic":
            return None

        prompt = f"""
{COPILOT_SYSTEM_PROMPT}

VERIFIED TOOL DATA (GROUND TRUTH):
{tool_context}

INVESTIGATOR QUERY:
{user_query}

Provide a grounded, professional investigation analysis based exclusively on the verified tool data above.
"""

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(
                    f"{self.base_url}/api/generate",
                    json={
                        "model": self.model,
                        "prompt": prompt,
                        "stream": False,
                        "options": {
                            "temperature": 0.1,  # Low temperature to prevent hallucination
                            "num_predict": 400
                        }
                    }
                )
                if res.status_code == 200:
                    data = res.json()
                    return data.get("response", "").strip()
        except Exception:
            # Ollama not running or model not pulled
            pass
        return None

local_llm_service = LocalLLMService()
