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

        history_str = ""
        if conversation_history and len(conversation_history) > 0:
            formatted_turns = []
            for h in conversation_history[-4:]:
                role = "Investigator" if h.get("role") == "user" else "Copilot"
                formatted_turns.append(f"{role}: {h.get('content', '')}")
            history_str = "PREVIOUS CONVERSATION CONTEXT:\n" + "\n".join(formatted_turns) + "\n\n"

        prompt = f"""
{COPILOT_SYSTEM_PROMPT}

{history_str}VERIFIED CASE INTELLIGENCE & TOOL DATA:
{tool_context}

CURRENT INVESTIGATOR QUESTION:
{user_query}

Respond directly to the investigator in a natural, professional human officer tone, addressing their exact question with grounded case details.
"""

        try:
            timeout = httpx.Timeout(5.0, connect=1.0)
            async with httpx.AsyncClient(timeout=timeout) as client:
                res = await client.post(
                    f"{self.base_url}/api/generate",
                    json={
                        "model": self.model,
                        "prompt": prompt,
                        "stream": False,
                        "options": {
                            "temperature": 0.3,
                            "num_predict": 450
                        }
                    }
                )
                if res.status_code == 200:
                    data = res.json()
                    resp_text = data.get("response", "").strip()
                    if resp_text and len(resp_text) > 10:
                        return resp_text
        except Exception:
            # Ollama offline or unavailable
            pass
        return None

local_llm_service = LocalLLMService()
