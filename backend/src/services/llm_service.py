"""
LLM service for embeddings and answer generation.
Supports Gemini and ChatKit providers.
"""

import logging
import time
from typing import List, Optional
from pathlib import Path

import google.generativeai as genai

from ..config import config


logger = logging.getLogger(__name__)


class LLMService:
    """
    Service for LLM operations (embeddings and text generation).

    Auto-selects provider based on LLM_PROVIDER environment variable.
    Implements rate limiting and exponential backoff for API calls.
    """

    def __init__(self):
        """Initialize LLM service based on configured provider."""
        self.provider = config.llm_provider.lower()
        self.system_prompt = self._load_system_prompt()

        # Initialize provider
        if self.provider == "gemini":
            genai.configure(api_key=config.gemini_api_key)
            self.embedding_model = "models/text-embedding-004"
            # Use the latest stable flash model
            self.generation_model = genai.GenerativeModel("gemini-2.5-flash")
            logger.info("Initialized Gemini LLM provider with gemini-2.5-flash")

        elif self.provider == "chatkit":
            raise NotImplementedError("ChatKit provider not yet implemented")

        else:
            raise ValueError(f"Unsupported LLM provider: {self.provider}")

        # Rate limiting configuration
        self.last_request_time = 0.0
        self.min_request_interval = 4.0  # 15 RPM for Gemini

    def _load_system_prompt(self) -> str:
        """Load system prompt template from config file."""
        prompt_path = (
            Path(__file__).parent.parent.parent.parent
            / "config"
            / "system_prompt.txt"
        )

        try:
            with open(prompt_path, "r") as f:
                prompt = f.read().strip()

            # Required placeholders
            required = ["{context}", "{query}", "{selected_text}"]
            if not all(x in prompt for x in required):
                logger.warning("System prompt missing placeholders. Using fallback prompt.")
                raise Exception("Bad prompt format")

            return prompt

        except Exception as e:
            logger.error(f"Failed to load system prompt: {e}")
            return (
                "You are a helpful AI assistant for the Physical AI book.\n"
                "Use the following context to answer the question.\n\n"
                "Context:\n{context}\n\n"
                "Question: {query}\n\n"
                "Selected: {selected_text}\n\n"
                "If the context does not contain the answer, reply politely: "
                "\"I can only answer questions based on the Physical AI book content.\""
            )

    def _wait_for_rate_limit(self) -> None:
        """Wait to respect rate limits (Gemini Free Tier)."""
        elapsed = time.time() - self.last_request_time
        if elapsed < self.min_request_interval:
            wait_time = self.min_request_interval - elapsed
            logger.debug(f"Rate limiting: waiting {wait_time:.2f} seconds")
            time.sleep(wait_time)
        self.last_request_time = time.time()

    # ---------------------------------------------------------------
    # Embeddings
    # ---------------------------------------------------------------
    def generate_embedding(
        self,
        text: str,
        retry_count: int = 3,
        retry_delay: float = 1.0,
    ) -> List[float]:

        for attempt in range(retry_count):
            try:
                self._wait_for_rate_limit()

                result = genai.embed_content(
                    model=self.embedding_model,
                    content=text,
                    task_type="retrieval_document",
                )

                embedding = result["embedding"]
                return embedding

            except Exception as e:
                if attempt < retry_count - 1:
                    wait = retry_delay * (2 ** attempt)
                    logger.warning(
                        f"Embedding failed ({attempt + 1}/{retry_count}): {e}. Retrying in {wait:.2f}s"
                    )
                    time.sleep(wait)
                else:
                    logger.error(f"Embedding failed after retries: {e}")
                    raise

    def generate_embedding_batch(
        self,
        texts: List[str],
        batch_size: int = 10,
    ) -> List[List[float]]:

        embeddings = []
        total = len(texts)

        for i in range(0, total, batch_size):
            batch = texts[i:i + batch_size]
            logger.info(f"Embedding batch {i // batch_size + 1}")

            for text in batch:
                embeddings.append(self.generate_embedding(text))

        return embeddings

    # ---------------------------------------------------------------
    # Answer Generation
    # ---------------------------------------------------------------
    def generate_answer(
        self,
        query: str,
        context_chunks: List[str],
        selected_text: Optional[str] = None,
        retry_count: int = 3,
        retry_delay: float = 1.0,
    ) -> str:

        # No context fallback
        if not context_chunks:
            logger.warning("No context chunks retrieved from vector DB.")
            return (
                "I could not find relevant content in the Physical AI book for this question."
            )

        # Build context
        context = "\n\n".join(
            [f"[Context {i+1}]\n{chunk}" for i, chunk in enumerate(context_chunks)]
        )

        # Combine into final prompt
        prompt = self.system_prompt.format(
            context=context,
            query=query,
            selected_text=selected_text or "None",
        )

        for attempt in range(retry_count):
            try:
                self._wait_for_rate_limit()

                response = self.generation_model.generate_content(
                    prompt,
                    safety_settings={"HARASSMENT": "BLOCK_NONE"},
                )

                answer = response.text or "No answer generated."
                return answer

            except Exception as e:
                if attempt < retry_count - 1:
                    wait = retry_delay * (2 ** attempt)
                    logger.warning(
                        f"Answer generation failed ({attempt + 1}/{retry_count}): {e}. Retrying in {wait:.2f}s"
                    )
                    time.sleep(wait)
                else:
                    logger.error(f"Answer failed after all retries: {e}")
                    # Return fallback message instead of raising
                    return (
                        "I apologize, but I'm experiencing technical difficulties generating a response. "
                        "The content from the Physical AI book was retrieved, but I couldn't process it. "
                        "Please try again in a moment."
                    )

    # ---------------------------------------------------------------
    # Health Check
    # ---------------------------------------------------------------
    def health_check(self) -> bool:
        try:
            emb = self.generate_embedding("test", retry_count=1)
            if len(emb) == 768:
                return True
            logger.error(f"Embedding dimension mismatch: {len(emb)}")
            return False
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return False
